import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting data import into Lovable Cloud database...');
    
    const { data: importData } = await req.json();
    
    if (!importData) {
      throw new Error('No import data provided');
    }

    // Connect to current Lovable Cloud database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Connected to Lovable Cloud database');

    const results: any = {
      success: true,
      imported: {},
      errors: []
    };

    // Import in correct order to maintain foreign key relationships

    // 1. Profiles (linked to auth.users)
    if (importData.profiles?.length > 0) {
      console.log(`Importing ${importData.profiles.length} profiles...`);
      const { error } = await supabase
        .from('profiles')
        .upsert(importData.profiles, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing profiles:', error);
        results.errors.push({ table: 'profiles', error: error.message });
      } else {
        results.imported.profiles = importData.profiles.length;
        console.log(`✓ Imported ${importData.profiles.length} profiles`);
      }
    }

    // 2. User Roles
    if (importData.user_roles?.length > 0) {
      console.log(`Importing ${importData.user_roles.length} user roles...`);
      const { error } = await supabase
        .from('user_roles')
        .upsert(importData.user_roles, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing user_roles:', error);
        results.errors.push({ table: 'user_roles', error: error.message });
      } else {
        results.imported.user_roles = importData.user_roles.length;
        console.log(`✓ Imported ${importData.user_roles.length} user roles`);
      }
    }

    // 3. User Settings
    if (importData.user_settings?.length > 0) {
      console.log(`Importing ${importData.user_settings.length} user settings...`);
      const { error } = await supabase
        .from('user_settings')
        .upsert(importData.user_settings, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing user_settings:', error);
        results.errors.push({ table: 'user_settings', error: error.message });
      } else {
        results.imported.user_settings = importData.user_settings.length;
        console.log(`✓ Imported ${importData.user_settings.length} user settings`);
      }
    }

    // 4. Organizations
    if (importData.organizations?.length > 0) {
      console.log(`Importing ${importData.organizations.length} organizations...`);
      const { error } = await supabase
        .from('organizations')
        .upsert(importData.organizations, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing organizations:', error);
        results.errors.push({ table: 'organizations', error: error.message });
      } else {
        results.imported.organizations = importData.organizations.length;
        console.log(`✓ Imported ${importData.organizations.length} organizations`);
      }
    }

    // 5. Org Members
    if (importData.org_members?.length > 0) {
      console.log(`Importing ${importData.org_members.length} org members...`);
      const { error } = await supabase
        .from('org_members')
        .upsert(importData.org_members, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing org_members:', error);
        results.errors.push({ table: 'org_members', error: error.message });
      } else {
        results.imported.org_members = importData.org_members.length;
        console.log(`✓ Imported ${importData.org_members.length} org members`);
      }
    }

    // 6. Customers
    if (importData.customers?.length > 0) {
      console.log(`Importing ${importData.customers.length} customers...`);
      const { error } = await supabase
        .from('customers')
        .upsert(importData.customers, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing customers:', error);
        results.errors.push({ table: 'customers', error: error.message });
      } else {
        results.imported.customers = importData.customers.length;
        console.log(`✓ Imported ${importData.customers.length} customers`);
      }
    }

    // 7. Billing Subscriptions
    if (importData.billing_subscriptions?.length > 0) {
      console.log(`Importing ${importData.billing_subscriptions.length} billing subscriptions...`);
      const { error } = await supabase
        .from('billing_subscriptions')
        .upsert(importData.billing_subscriptions, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing billing_subscriptions:', error);
        results.errors.push({ table: 'billing_subscriptions', error: error.message });
      } else {
        results.imported.billing_subscriptions = importData.billing_subscriptions.length;
        console.log(`✓ Imported ${importData.billing_subscriptions.length} billing subscriptions`);
      }
    }

    // 8. Plans
    if (importData.plans?.length > 0) {
      console.log(`Importing ${importData.plans.length} plans...`);
      const { error } = await supabase
        .from('plans')
        .upsert(importData.plans, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing plans:', error);
        results.errors.push({ table: 'plans', error: error.message });
      } else {
        results.imported.plans = importData.plans.length;
        console.log(`✓ Imported ${importData.plans.length} plans`);
      }
    }

    // 9. Invoices
    if (importData.invoices?.length > 0) {
      console.log(`Importing ${importData.invoices.length} invoices...`);
      const { error } = await supabase
        .from('invoices')
        .upsert(importData.invoices, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing invoices:', error);
        results.errors.push({ table: 'invoices', error: error.message });
      } else {
        results.imported.invoices = importData.invoices.length;
        console.log(`✓ Imported ${importData.invoices.length} invoices`);
      }
    }

    // 10. Invoice Items
    if (importData.invoice_items?.length > 0) {
      console.log(`Importing ${importData.invoice_items.length} invoice items...`);
      const { error } = await supabase
        .from('invoice_items')
        .upsert(importData.invoice_items, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing invoice_items:', error);
        results.errors.push({ table: 'invoice_items', error: error.message });
      } else {
        results.imported.invoice_items = importData.invoice_items.length;
        console.log(`✓ Imported ${importData.invoice_items.length} invoice items`);
      }
    }

    // 11. Estimates
    if (importData.estimates?.length > 0) {
      console.log(`Importing ${importData.estimates.length} estimates...`);
      const { error } = await supabase
        .from('estimates')
        .upsert(importData.estimates, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing estimates:', error);
        results.errors.push({ table: 'estimates', error: error.message });
      } else {
        results.imported.estimates = importData.estimates.length;
        console.log(`✓ Imported ${importData.estimates.length} estimates`);
      }
    }

    // 12. Estimate Items
    if (importData.estimate_items?.length > 0) {
      console.log(`Importing ${importData.estimate_items.length} estimate items...`);
      const { error } = await supabase
        .from('estimate_items')
        .upsert(importData.estimate_items, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing estimate_items:', error);
        results.errors.push({ table: 'estimate_items', error: error.message });
      } else {
        results.imported.estimate_items = importData.estimate_items.length;
        console.log(`✓ Imported ${importData.estimate_items.length} estimate items`);
      }
    }

    // 13. Receipts
    if (importData.receipts?.length > 0) {
      console.log(`Importing ${importData.receipts.length} receipts...`);
      const { error } = await supabase
        .from('receipts')
        .upsert(importData.receipts, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing receipts:', error);
        results.errors.push({ table: 'receipts', error: error.message });
      } else {
        results.imported.receipts = importData.receipts.length;
        console.log(`✓ Imported ${importData.receipts.length} receipts`);
      }
    }

    // 14. Receipt Items
    if (importData.receipt_items?.length > 0) {
      console.log(`Importing ${importData.receipt_items.length} receipt items...`);
      const { error } = await supabase
        .from('receipt_items')
        .upsert(importData.receipt_items, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing receipt_items:', error);
        results.errors.push({ table: 'receipt_items', error: error.message });
      } else {
        results.imported.receipt_items = importData.receipt_items.length;
        console.log(`✓ Imported ${importData.receipt_items.length} receipt items`);
      }
    }

    // 15. Payments
    if (importData.payments?.length > 0) {
      console.log(`Importing ${importData.payments.length} payments...`);
      const { error } = await supabase
        .from('payments')
        .upsert(importData.payments, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing payments:', error);
        results.errors.push({ table: 'payments', error: error.message });
      } else {
        results.imported.payments = importData.payments.length;
        console.log(`✓ Imported ${importData.payments.length} payments`);
      }
    }

    // 16. Billing Events
    if (importData.billing_events?.length > 0) {
      console.log(`Importing ${importData.billing_events.length} billing events...`);
      const { error } = await supabase
        .from('billing_events')
        .upsert(importData.billing_events, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing billing_events:', error);
        results.errors.push({ table: 'billing_events', error: error.message });
      } else {
        results.imported.billing_events = importData.billing_events.length;
        console.log(`✓ Imported ${importData.billing_events.length} billing events`);
      }
    }

    // 17. Notifications
    if (importData.notifications?.length > 0) {
      console.log(`Importing ${importData.notifications.length} notifications...`);
      const { error } = await supabase
        .from('notifications')
        .upsert(importData.notifications, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing notifications:', error);
        results.errors.push({ table: 'notifications', error: error.message });
      } else {
        results.imported.notifications = importData.notifications.length;
        console.log(`✓ Imported ${importData.notifications.length} notifications`);
      }
    }

    // 18. Activity Logs
    if (importData.activity_logs?.length > 0) {
      console.log(`Importing ${importData.activity_logs.length} activity logs...`);
      const { error } = await supabase
        .from('activity_logs')
        .upsert(importData.activity_logs, { onConflict: 'id' });
      
      if (error) {
        console.error('Error importing activity_logs:', error);
        results.errors.push({ table: 'activity_logs', error: error.message });
      } else {
        results.imported.activity_logs = importData.activity_logs.length;
        console.log(`✓ Imported ${importData.activity_logs.length} activity logs`);
      }
    }

    console.log('Import completed!');
    console.log('Summary:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
