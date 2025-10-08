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

    const now = new Date();
    const reminderIntervals = [
      { days: 7, type: "7_days_left" },
      { days: 2, type: "2_days_left" },
      { days: 1, type: "1_day_left" },
    ];

    let totalReminders = 0;

    for (const interval of reminderIntervals) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + interval.days);
      
      // Find trials ending in exactly N days
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

      const { data: trials, error: fetchError } = await supabase
        .from("billing_subscriptions")
        .select("*, organizations(owner_id, name)")
        .eq("status", "trialing")
        .gte("trial_end", startOfDay)
        .lte("trial_end", endOfDay);

      if (fetchError) {
        console.error(`Error fetching ${interval.days}-day trials:`, fetchError);
        continue;
      }

      console.log(`Found ${trials?.length || 0} trials ending in ${interval.days} days`);

      for (const trial of trials || []) {
        // Check if we already sent this reminder
        const { data: existingEvent } = await supabase
          .from("billing_events")
          .select("id")
          .eq("org_id", trial.org_id)
          .eq("event_type", `trial_reminder_${interval.type}`)
          .single();

        if (existingEvent) {
          console.log(`Reminder already sent for org ${trial.org_id}`);
          continue;
        }

        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          trial.organizations.owner_id
        );

        if (!userError && userData?.user?.email) {
          // Send reminder email
          const { error: emailError } = await supabase.functions.invoke("send-trial-email", {
            body: {
              email: userData.user.email,
              type: interval.type,
              orgName: trial.organizations.name,
              daysLeft: interval.days,
              trialEnd: trial.trial_end,
            },
          });

          if (!emailError) {
            // Log the reminder event
            await supabase.from("billing_events").insert({
              event_type: `trial_reminder_${interval.type}`,
              org_id: trial.org_id,
              metadata: {
                days_left: interval.days,
                trial_end: trial.trial_end,
              },
            });

            totalReminders++;
            console.log(`Sent ${interval.days}-day reminder to ${userData.user.email}`);
          } else {
            console.error(`Error sending reminder email:`, emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent: totalReminders,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-trial-reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});