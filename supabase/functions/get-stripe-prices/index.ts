// Edge Function to fetch your real Stripe price IDs
// This will help us get the correct price IDs from your Stripe account

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-09-30.clover" 
    });

    // Get all products
    console.log("📦 Fetching Stripe products...");
    const products = await stripe.products.list({ limit: 10 });
    
    const swiftfactureProducts = products.data.filter(p => 
      p.name.toLowerCase().includes('swiftfacture')
    );

    const results = [];

    for (const product of swiftfactureProducts) {
      console.log(`🔍 Checking product: ${product.name}`);
      
      // Get prices for this product
      const prices = await stripe.prices.list({ 
        product: product.id,
        active: true,
        type: 'recurring'
      });

      for (const price of prices.data) {
        results.push({
          product_name: product.name,
          product_id: product.id,
          price_id: price.id,
          amount: price.unit_amount / 100,
          currency: price.currency,
          interval: price.recurring?.interval,
          suggested_plan_id: product.name.toLowerCase().includes('starter') ? 'starter' :
                           product.name.toLowerCase().includes('professional') ? 'pro' :
                           product.name.toLowerCase().includes('enterprise') ? 'enterprise' :
                           'unknown'
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      prices: results,
      update_sql: results.map(r => 
        `UPDATE public.plans SET stripe_price_id = '${r.price_id}', stripe_product_id = '${r.product_id}' WHERE id = '${r.suggested_plan_id}';`
      ).join('\n')
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error fetching Stripe data:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});