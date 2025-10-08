import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  type: string;
  orgName: string;
  daysLeft?: number;
  trialEnd?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, orgName, daysLeft, trialEnd }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email}`);

    // Email templates
    const templates: Record<string, { subject: string; html: string }> = {
      welcome: {
        subject: "Welcome to SwiftFacture - Your 30-Day Trial Has Started!",
        html: `
          <h1>Welcome to SwiftFacture!</h1>
          <p>Thank you for signing up! Your 30-day free trial has started.</p>
          <p><strong>Organization:</strong> ${orgName}</p>
          <p><strong>Trial ends:</strong> ${trialEnd ? new Date(trialEnd).toLocaleDateString() : 'in 30 days'}</p>
          <p>During your trial, you'll have full access to all SwiftFacture features:</p>
          <ul>
            <li>Unlimited invoices and estimates</li>
            <li>Customer management</li>
            <li>Beautiful invoice templates</li>
            <li>Payment tracking</li>
            <li>And much more!</li>
          </ul>
          <p>Get started now and experience the power of SwiftFacture.</p>
          <p>Best regards,<br>The SwiftFacture Team</p>
        `,
      },
      "7_days_left": {
        subject: "Your SwiftFacture Trial Ends in 7 Days",
        html: `
          <h1>Your Trial is Ending Soon</h1>
          <p>Your SwiftFacture trial will end in <strong>7 days</strong>.</p>
          <p><strong>Trial ends:</strong> ${trialEnd ? new Date(trialEnd).toLocaleDateString() : ''}</p>
          <p>Don't lose access to your invoices and customer data!</p>
          <p>Upgrade now to continue using SwiftFacture without interruption.</p>
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/premium" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade Now</a></p>
          <p>Best regards,<br>The SwiftFacture Team</p>
        `,
      },
      "2_days_left": {
        subject: "Only 2 Days Left in Your SwiftFacture Trial",
        html: `
          <h1>Final Reminder: 2 Days Left</h1>
          <p>Your SwiftFacture trial ends in just <strong>2 days</strong>!</p>
          <p><strong>Trial ends:</strong> ${trialEnd ? new Date(trialEnd).toLocaleDateString() : ''}</p>
          <p>Time is running out! Upgrade today to:</p>
          <ul>
            <li>Keep all your invoices and data</li>
            <li>Continue managing your customers</li>
            <li>Access all premium features</li>
          </ul>
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/premium" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade Now</a></p>
          <p>Best regards,<br>The SwiftFacture Team</p>
        `,
      },
      "1_day_left": {
        subject: "Last Day of Your SwiftFacture Trial!",
        html: `
          <h1>Last Chance: Trial Ends Tomorrow!</h1>
          <p>This is your final reminder - your SwiftFacture trial ends <strong>tomorrow</strong>!</p>
          <p><strong>Trial ends:</strong> ${trialEnd ? new Date(trialEnd).toLocaleDateString() : ''}</p>
          <p>After your trial ends, you won't be able to:</p>
          <ul>
            <li>Create new invoices</li>
            <li>Access your customer data</li>
            <li>Use any SwiftFacture features</li>
          </ul>
          <p>Don't wait! Upgrade now to keep your business running smoothly.</p>
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/premium" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade Now</a></p>
          <p>Best regards,<br>The SwiftFacture Team</p>
        `,
      },
      expired: {
        subject: "Your SwiftFacture Trial Has Ended",
        html: `
          <h1>Your Trial Has Ended</h1>
          <p>Your 30-day free trial of SwiftFacture has expired.</p>
          <p>To continue using SwiftFacture and access your data, please upgrade to a paid plan.</p>
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/premium" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Plans & Upgrade</a></p>
          <p>We hope to see you back soon!</p>
          <p>Best regards,<br>The SwiftFacture Team</p>
        `,
      },
    };

    const template = templates[type] || templates.expired;

    // For now, just log the email (you can integrate with SendGrid/Mailgun/Postmark later)
    console.log("Email would be sent:", {
      to: email,
      subject: template.subject,
      html: template.html,
    });

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    // if (RESEND_API_KEY) {
    //   const res = await fetch("https://api.resend.com/emails", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${RESEND_API_KEY}`,
    //     },
    //     body: JSON.stringify({
    //       from: "SwiftFacture <noreply@swiftfacture.com>",
    //       to: [email],
    //       subject: template.subject,
    //       html: template.html,
    //     }),
    //   });
    // }

    return new Response(
      JSON.stringify({ success: true, message: "Email logged successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-trial-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});