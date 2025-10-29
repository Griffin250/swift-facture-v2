import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-09-30.clover"
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use service role for database writes
);

// Product ID to plan ID mapping
const PRODUCT_PLAN_MAPPING: Record<string, string> = {
  'prod_TJ335JbTq1eIeC': 'starter',
  'prod_TJ35UueOk9C6Iz': 'professional', 
  'prod_TJ36iP5VIL2ZVu': 'enterprise'
};

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    logStep("Processing subscription change", { subscriptionId: subscription.id });

    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found");
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Find user by email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find(u => u.email === customerEmail);
    if (!user) {
      throw new Error(`User not found for email: ${customerEmail}`);
    }

    // Get user's organization
    const { data: orgMember, error: orgError } = await supabaseClient
      .from('org_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      throw new Error(`Organization not found for user: ${user.id}`);
    }

    // Get plan ID from subscription
    const productId = subscription.items.data[0].price.product as string;
    const planId = PRODUCT_PLAN_MAPPING[productId];

    if (!planId) {
      throw new Error(`Unknown product ID: ${productId}`);
    }

    // Determine subscription status
    let status = 'active';
    if (subscription.status === 'canceled') status = 'canceled';
    else if (subscription.status === 'past_due') status = 'past_due';
    else if (subscription.status === 'unpaid') status = 'expired';

    // Update or insert billing subscription
    const subscriptionData = {
      organization_id: orgMember.organization_id,
      plan_id: planId,
      status: status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    };

    const { data: existingSub, error: findError } = await supabaseClient
      .from('billing_subscriptions')
      .select('id')
      .eq('organization_id', orgMember.organization_id)
      .single();

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabaseClient
        .from('billing_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id);

      if (updateError) throw updateError;
      logStep("Updated existing subscription", { subscriptionId: existingSub.id });
    } else {
      // Create new subscription
      const { data: newSub, error: insertError } = await supabaseClient
        .from('billing_subscriptions')
        .insert(subscriptionData)
        .select('id')
        .single();

      if (insertError) throw insertError;
      logStep("Created new subscription", { subscriptionId: newSub.id });
    }

    // Log billing event
    await supabaseClient
      .from('billing_events')
      .insert({
        organization_id: orgMember.organization_id,
        event_type: `subscription_${subscription.status}`,
        event_data: {
          stripe_subscription_id: subscription.id,
          plan_id: planId,
          status: status,
          product_id: productId
        }
      });

    logStep("Subscription change processed successfully");
    return { success: true };

  } catch (error) {
    logStep("ERROR processing subscription change", { error: String(error) });
    throw error;
  }
}

async function handlePaymentEvent(invoice: Stripe.Invoice) {
  try {
    logStep("Processing payment event", { 
      invoiceId: invoice.id, 
      status: invoice.status,
      paid: (invoice as any).paid || false 
    });

    // Get customer details
    const customer = await stripe.customers.retrieve(invoice.customer as string);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found");
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Find user and organization (similar to subscription handler)
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find(u => u.email === customerEmail);
    if (!user) {
      throw new Error(`User not found for email: ${customerEmail}`);
    }

    const { data: orgMember, error: orgError } = await supabaseClient
      .from('org_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      throw new Error(`Organization not found for user: ${user.id}`);
    }

    // Log payment event
    const eventType = (invoice as any).paid ? 'payment_succeeded' : 'payment_failed';
    await supabaseClient
      .from('billing_events')
      .insert({
        organization_id: orgMember.organization_id,
        event_type: eventType,
        event_data: {
          stripe_invoice_id: invoice.id,
          amount_paid: invoice.amount_paid,
          amount_due: invoice.amount_due,
          currency: invoice.currency,
          status: invoice.status
        }
      });

    logStep("Payment event processed successfully");
    return { success: true };

  } catch (error) {
    logStep("ERROR processing payment event", { error: String(error) });
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    if (!webhookSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: String(err) });
      return new Response("Invalid signature", { status: 400 });
    }

    logStep("Processing webhook event", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await handlePaymentEvent(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        logStep("Trial ending soon", { subscriptionId: (event.data.object as Stripe.Subscription).id });
        // Could send notification email here
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Webhook processing failed", { error: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});