import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  // Only log in development mode
  if (Deno.env.get("ENVIRONMENT") === "development") {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
  }
};

serve(async (req) => {
  try {
    console.log("🚀 [EDGE-FUNCTION] create-checkout called", {
      method: req.method,
      url: req.url,
      hasAuthHeader: !!req.headers.get("authorization"),
      contentType: req.headers.get("content-type"),
      timestamp: new Date().toISOString()
    });

    if (req.method === "OPTIONS") {
      console.log("✅ [EDGE-FUNCTION] Handling OPTIONS request");
      return new Response(null, { headers: corsHeaders });
    }

    console.log("🔧 [EDGE-FUNCTION] Creating Supabase client");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get request body
    const requestBody = await req.json();
    const { price_id, plan_id } = requestBody;
    if (!price_id) throw new Error("price_id is required");
    
    // Validate price_id format (Stripe price IDs start with 'price_')
    if (!price_id || (!price_id.startsWith('price_') && !price_id.startsWith('test_')) || price_id.includes('placeholder')) {
      logStep("Invalid price_id detected", { 
        price_id, 
        error: `Invalid Stripe price ID format: ${price_id}`,
        suggestion: "Use real Stripe price IDs starting with 'price_' or 'test_'"
      });
      throw new Error(`Invalid Stripe price ID: ${price_id}. Please ensure your plans are configured with valid Stripe price IDs.`);
    }
    
    logStep("Checkout request", { price_id, plan_id, fullBody: requestBody });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY environment variable not set");
    logStep("Stripe key found", { keyLength: stripeKey.length, keyPrefix: stripeKey.substring(0, 7) });
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-09-30.clover" 
    });
    
    // Pre-flight check: Validate the price exists
    try {
      const priceCheck = await stripe.prices.retrieve(price_id);
      logStep("Price validation successful", { 
        priceId: price_id, 
        currency: priceCheck.currency,
        amount: priceCheck.unit_amount,
        product: priceCheck.product
      });
    } catch (priceError) {
      logStep("Price validation failed", { 
        price_id, 
        error: priceError instanceof Error ? priceError.message : String(priceError) 
      });
      throw new Error(`Price '${price_id}' not found in your Stripe account: ${priceError instanceof Error ? priceError.message : 'Unknown error'}`);
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
      
      // Check for existing subscriptions and their currency
      const existingSubs = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
      if (existingSubs.data.length > 0) {
        const existingCurrency = existingSubs.data[0].currency;
        logStep("Found existing subscription", { currency: existingCurrency });
        
        // Get the currency of the new price
        let priceDetails, newCurrency;
        try {
          priceDetails = await stripe.prices.retrieve(price_id);
          newCurrency = priceDetails.currency;
          logStep("Retrieved price details", { priceId: price_id, currency: newCurrency });
        } catch (priceError) {
          logStep("Failed to retrieve price details", { 
            price_id, 
            error: priceError instanceof Error ? priceError.message : String(priceError) 
          });
          throw new Error(`Invalid price ID '${price_id}': ${priceError instanceof Error ? priceError.message : 'Unknown error'}`);
        }
        
        if (existingCurrency !== newCurrency) {
          logStep("Currency mismatch detected", { existingCurrency, newCurrency });
          throw new Error(`You already have an active subscription in ${existingCurrency.toUpperCase()}. Please cancel your current subscription first or contact support to change currencies.`);
        }
      }
    } else {
      logStep("No existing customer found, will create during checkout");
    }

    // Create checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/billing?success=true`,
        cancel_url: `${req.headers.get("origin")}/premium?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_id: plan_id || 'unknown'
        }
      });
    } catch (stripeError) {
      const stripeMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("Stripe checkout creation failed", { 
        error: stripeMessage,
        price_id,
        customerId,
        user_email: user.email 
      });
      
      if (stripeMessage.includes('No such price')) {
        throw new Error(`The selected plan is not properly configured. Price ID '${price_id}' was not found in Stripe. Please contact support.`);
      }
      
      throw new Error(`Failed to create checkout session: ${stripeMessage}`);
    }

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    logStep("CRITICAL ERROR in create-checkout", { 
      message: errorMessage,
      stack: errorStack,
      error: String(error),
      timestamp: new Date().toISOString()
    });
    
    // Log environment info for debugging
    logStep("Environment debug", {
      hasStripeKey: !!Deno.env.get("STRIPE_SECRET_KEY"),
      stripeKeyPrefix: Deno.env.get("STRIPE_SECRET_KEY")?.substring(0, 7),
      supabaseUrl: !!Deno.env.get("SUPABASE_URL")
    });
    
    // Provide user-friendly error for common issues
    let userMessage = errorMessage;
    if (errorMessage.includes('cannot combine currencies')) {
      userMessage = 'Currency mismatch: Your Stripe account has a different currency. Please contact support.';
    } else if (errorMessage.includes('No such price')) {
      userMessage = `Price ID not found in Stripe: ${errorMessage}`;
    } else if (errorMessage.includes('test_')) {
      userMessage = 'Test keys cannot access live mode resources. Please check your Stripe configuration.';
    }
    
    return new Response(JSON.stringify({ 
      error: userMessage,
      debug: {
        message: errorMessage,
        stack: errorStack.substring(0, 500), // Limit stack trace length
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
