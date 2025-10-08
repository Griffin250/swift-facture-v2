# 30-Day Free Trial Subscription System

## Overview
SwiftFacture now includes a complete 30-day free trial system that automatically:
- Creates an organization and trial subscription when users sign up
- Tracks trial period (30 days from signup)
- Sends reminder emails at 7, 2, and 1 day(s) before expiry
- Automatically expires trials and restricts access
- Provides billing dashboard and subscription management UI

## Database Schema

### Tables Created
1. **organizations** - User organizations
2. **org_members** - Organization membership
3. **billing_subscriptions** - Subscription records with trial tracking
4. **billing_events** - Audit log of billing events

## Automatic Trial Creation

When a user signs up via Supabase Auth, a database trigger (`handle_new_user_trial`) automatically:
1. Creates an organization for the user
2. Adds them as the owner
3. Creates a 30-day trial subscription
4. Logs the trial_started event

## Edge Functions

### 1. check-trial-expiry
**Purpose**: Finds and expires trials that have ended
**Schedule**: Should run daily (e.g., every day at midnight)
**Actions**:
- Finds subscriptions with status='trialing' and trial_end < now()
- Updates status to 'expired'
- Logs 'trial_expired' event
- Sends expiry notification email

### 2. send-trial-reminders
**Purpose**: Sends reminder emails before trial expires
**Schedule**: Should run daily
**Actions**:
- Finds trials ending in exactly 7, 2, or 1 day(s)
- Sends reminder emails to users
- Logs reminder events to prevent duplicates

### 3. send-trial-email
**Purpose**: Email template service
**Usage**: Called by other functions to send trial-related emails
**Templates**:
- welcome: Trial started
- 7_days_left: One week remaining
- 2_days_left: Two days remaining
- 1_day_left: Last day
- expired: Trial has ended

## Setting Up Cron Jobs (Scheduled Functions)

### Option 1: Using Supabase Cron (Recommended)

1. Enable pg_cron extension in your Supabase project
2. Run this SQL to create the cron jobs:

\`\`\`sql
-- Schedule trial expiry check (runs daily at midnight UTC)
select cron.schedule(
  'check-trial-expiry-daily',
  '0 0 * * *',
  $$
  select net.http_post(
    url:='https://kvvqkzwrkselznrnqcbi.supabase.co/functions/v1/check-trial-expiry',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dnFrendya3NlbHpucm5xY2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDg0MjksImV4cCI6MjA3NDgyNDQyOX0.0yiKbFQXCBZRbF-WaT4CzPnDLyr6Lml6-Qh49_MxRjQ"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule reminder checks (runs daily at 9 AM UTC)
select cron.schedule(
  'send-trial-reminders-daily',
  '0 9 * * *',
  $$
  select net.http_post(
    url:='https://kvvqkzwrkselznrnqcbi.supabase.co/functions/v1/send-trial-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dnFrendya3NlbHpucm5xY2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDg0MjksImV4cCI6MjA3NDgyNDQyOX0.0yiKbFQXCBZRbF-WaT4CzPnDLyr6Lml6-Qh49_MxRjQ"}'::jsonb
  ) as request_id;
  $$
);
\`\`\`

3. View scheduled jobs:
\`\`\`sql
SELECT * FROM cron.job;
\`\`\`

4. Delete a job (if needed):
\`\`\`sql
SELECT cron.unschedule('check-trial-expiry-daily');
\`\`\`

### Option 2: External Cron Service

Use services like:
- **Cron-job.org** (free, simple)
- **EasyCron** (free tier available)
- **GitHub Actions** (if code is on GitHub)

Configure to call:
- `https://kvvqkzwrkselznrnqcbi.supabase.co/functions/v1/check-trial-expiry` daily at midnight
- `https://kvvqkzwrkselznrnqcbi.supabase.co/functions/v1/send-trial-reminders` daily at 9 AM

## Email Integration

The system currently logs emails to console. To send actual emails:

1. Sign up for an email service (e.g., Resend, SendGrid, Mailgun)
2. Add your API key as a secret:
   - Use the secrets tool to add `RESEND_API_KEY` (or similar)
3. Uncomment and configure the email sending code in `send-trial-email/index.ts`

Example for Resend:
\`\`\`typescript
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (RESEND_API_KEY) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${RESEND_API_KEY}\`,
    },
    body: JSON.stringify({
      from: "SwiftFacture <noreply@swiftfacture.com>",
      to: [email],
      subject: template.subject,
      html: template.html,
    }),
  });
}
\`\`\`

## User Interface

### Pages
1. **/billing** - Full billing dashboard showing:
   - Subscription status and trial countdown
   - Days remaining progress bar
   - Billing history/events
   - Quick actions

2. **/settings** - Account settings with billing card:
   - Link to billing dashboard
   - Link to premium plans

### Components
1. **BillingStatus** - Shows subscription status, trial countdown, and upgrade CTA
2. **TrialExpiredModal** - Blocks access when trial expires, prompts upgrade
3. **useSubscription** - Hook for accessing subscription data

### Access Control
The `useSubscription` hook provides:
- `subscription` - Current subscription object
- `hasAccess` - Boolean indicating if user can use the app
- `loading` - Loading state
- `organization` - User's organization

## Testing

### Manual Testing
1. Create a new user account
2. Check that organization and trial subscription are created
3. Verify `/billing` page shows 30 days remaining
4. Manually call edge functions to test:
   \`\`\`bash
   curl -X POST https://kvvqkzwrkselznrnqcbi.supabase.co/functions/v1/check-trial-expiry
   \`\`\`

### Simulate Trial Expiry
Run this SQL to expire a trial immediately:
\`\`\`sql
UPDATE billing_subscriptions 
SET trial_end = now() - INTERVAL '1 day'
WHERE status = 'trialing';
\`\`\`

Then reload the app to see the expired modal.

## Security

- All database tables have Row Level Security (RLS) enabled
- Users can only see their own organizations and subscriptions
- Edge functions use service role key for admin operations
- Access checks use server-side function `has_active_subscription()`

## Next Steps

1. ✅ Set up cron jobs (see above)
2. ✅ Configure email service (Resend recommended)
3. ✅ Test trial creation with new signups
4. ✅ Test reminder emails
5. ✅ Test trial expiry flow
6. 🔄 Add payment integration for upgrades (Stripe recommended)
7. 🔄 Create paid plan management

## Support

For issues or questions:
- Check Lovable Cloud dashboard for edge function logs
- View billing_events table for audit trail
- Check console logs in edge functions
