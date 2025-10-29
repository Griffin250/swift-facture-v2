import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Only log errors in production
const logError = (message: string, details?: any) => {
  console.error(`[CHECK-SUBSCRIPTION] ${message}`, details || '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey || "", { 
      apiVersion: "2025-09-30.clover" 
    });

    // Check for Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan_id: null,
        product_id: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let planId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      // Safely handle the subscription end date
      const subData = subscription as any; // Type assertion to handle Stripe API differences
      if (subData.current_period_end) {
        try {
          subscriptionEnd = new Date(subData.current_period_end * 1000).toISOString();
        } catch (error) {
          console.error("Error converting subscription end date:", error);
          subscriptionEnd = null;
        }
      }
      
      productId = (subscription.items.data[0].price.product as any) || null;
      
      // Map product IDs to plan IDs
      const productToPlanMap: Record<string, string> = {
        'prod_TJ335JbTq1eIeC': 'starter',
        'prod_TJ35UueOk9C6Iz': 'professional',
        'prod_TJ36iP5VIL2ZVu': 'enterprise',
        'prod_TJ1FKRu0auL1vc': 'starter' // Additional starter product
      };
      
      planId = productToPlanMap[productId] || null;
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_id: planId,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError("ERROR in check-subscription", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
