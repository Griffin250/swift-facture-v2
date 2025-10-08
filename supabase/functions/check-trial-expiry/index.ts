import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for expired trials...");

    // Find all trialing subscriptions that have expired
    const { data: expiredTrials, error: fetchError } = await supabase
      .from("billing_subscriptions")
      .select("*, organizations(owner_id, name)")
      .eq("status", "trialing")
      .lt("trial_end", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired trials:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredTrials?.length || 0} expired trials`);

    // Update each expired trial
    for (const trial of expiredTrials || []) {
      // Update status to expired
      const { error: updateError } = await supabase
        .from("billing_subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", trial.id);

      if (updateError) {
        console.error(`Error updating trial ${trial.id}:`, updateError);
        continue;
      }

      // Log billing event
      const { error: eventError } = await supabase
        .from("billing_events")
        .insert({
          event_type: "trial_expired",
          org_id: trial.org_id,
          metadata: {
            subscription_id: trial.id,
            plan_id: trial.plan_id,
            trial_end: trial.trial_end,
          },
        });

      if (eventError) {
        console.error(`Error logging event for trial ${trial.id}:`, eventError);
      }

      // Get user email for notification
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        trial.organizations.owner_id
      );

      if (!userError && userData?.user?.email) {
        // Send expiry notification email
        const { error: emailError } = await supabase.functions.invoke("send-trial-email", {
          body: {
            email: userData.user.email,
            type: "expired",
            orgName: trial.organizations.name,
          },
        });

        if (emailError) {
          console.error(`Error sending email for trial ${trial.id}:`, emailError);
        }
      }

      console.log(`Successfully expired trial ${trial.id} for org ${trial.org_id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiredCount: expiredTrials?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-trial-expiry:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});