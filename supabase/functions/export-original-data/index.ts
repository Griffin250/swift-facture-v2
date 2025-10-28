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
    console.log('Starting data export from original database...');
    
    // Connect to original database
    const originalDb = createClient(
      'https://rlbhtujnuopelxxgssni.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYmh0dWpudW9wZWx4eGdzc25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYxNTg3NSwiZXhwIjoyMDc1MTkxODc1fQ.6FSlqV4P3pIWrcu13npOcbyNtcsPZQ6ONfaOnj-LqD0'
    );

    console.log('Connected to original database');

    // Export all tables
    const exportData: any = {};

    // Profiles
    console.log('Exporting profiles...');
    const { data: profiles, error: profilesError } = await originalDb
      .from('profiles')
      .select('*');
    if (profilesError) console.error('Error exporting profiles:', profilesError);
    exportData.profiles = profiles || [];
    console.log(`Exported ${profiles?.length || 0} profiles`);

    // User Roles
    console.log('Exporting user_roles...');
    const { data: userRoles, error: rolesError } = await originalDb
      .from('user_roles')
      .select('*');
    if (rolesError) console.error('Error exporting user_roles:', rolesError);
    exportData.user_roles = userRoles || [];
    console.log(`Exported ${userRoles?.length || 0} user roles`);

    // User Settings
    console.log('Exporting user_settings...');
    const { data: userSettings, error: settingsError } = await originalDb
      .from('user_settings')
      .select('*');
    if (settingsError) console.error('Error exporting user_settings:', settingsError);
    exportData.user_settings = userSettings || [];
    console.log(`Exported ${userSettings?.length || 0} user settings`);

    // Organizations
    console.log('Exporting organizations...');
    const { data: organizations, error: orgsError } = await originalDb
      .from('organizations')
      .select('*');
    if (orgsError) console.error('Error exporting organizations:', orgsError);
    exportData.organizations = organizations || [];
    console.log(`Exported ${organizations?.length || 0} organizations`);

    // Org Members
    console.log('Exporting org_members...');
    const { data: orgMembers, error: membersError } = await originalDb
      .from('org_members')
      .select('*');
    if (membersError) console.error('Error exporting org_members:', membersError);
    exportData.org_members = orgMembers || [];
    console.log(`Exported ${orgMembers?.length || 0} org members`);

    // Customers
    console.log('Exporting customers...');
    const { data: customers, error: customersError } = await originalDb
      .from('customers')
      .select('*');
    if (customersError) console.error('Error exporting customers:', customersError);
    exportData.customers = customers || [];
    console.log(`Exported ${customers?.length || 0} customers`);

    // Invoices
    console.log('Exporting invoices...');
    const { data: invoices, error: invoicesError } = await originalDb
      .from('invoices')
      .select('*');
    if (invoicesError) console.error('Error exporting invoices:', invoicesError);
    exportData.invoices = invoices || [];
    console.log(`Exported ${invoices?.length || 0} invoices`);

    // Invoice Items
    console.log('Exporting invoice_items...');
    const { data: invoiceItems, error: itemsError } = await originalDb
      .from('invoice_items')
      .select('*');
    if (itemsError) console.error('Error exporting invoice_items:', itemsError);
    exportData.invoice_items = invoiceItems || [];
    console.log(`Exported ${invoiceItems?.length || 0} invoice items`);

    // Estimates
    console.log('Exporting estimates...');
    const { data: estimates, error: estimatesError } = await originalDb
      .from('estimates')
      .select('*');
    if (estimatesError) console.error('Error exporting estimates:', estimatesError);
    exportData.estimates = estimates || [];
    console.log(`Exported ${estimates?.length || 0} estimates`);

    // Estimate Items
    console.log('Exporting estimate_items...');
    const { data: estimateItems, error: estItemsError } = await originalDb
      .from('estimate_items')
      .select('*');
    if (estItemsError) console.error('Error exporting estimate_items:', estItemsError);
    exportData.estimate_items = estimateItems || [];
    console.log(`Exported ${estimateItems?.length || 0} estimate items`);

    // Receipts
    console.log('Exporting receipts...');
    const { data: receipts, error: receiptsError } = await originalDb
      .from('receipts')
      .select('*');
    if (receiptsError) console.error('Error exporting receipts:', receiptsError);
    exportData.receipts = receipts || [];
    console.log(`Exported ${receipts?.length || 0} receipts`);

    // Receipt Items
    console.log('Exporting receipt_items...');
    const { data: receiptItems, error: recItemsError } = await originalDb
      .from('receipt_items')
      .select('*');
    if (recItemsError) console.error('Error exporting receipt_items:', recItemsError);
    exportData.receipt_items = receiptItems || [];
    console.log(`Exported ${receiptItems?.length || 0} receipt items`);

    // Payments
    console.log('Exporting payments...');
    const { data: payments, error: paymentsError } = await originalDb
      .from('payments')
      .select('*');
    if (paymentsError) console.error('Error exporting payments:', paymentsError);
    exportData.payments = payments || [];
    console.log(`Exported ${payments?.length || 0} payments`);

    // Billing Subscriptions
    console.log('Exporting billing_subscriptions...');
    const { data: subscriptions, error: subsError } = await originalDb
      .from('billing_subscriptions')
      .select('*');
    if (subsError) console.error('Error exporting billing_subscriptions:', subsError);
    exportData.billing_subscriptions = subscriptions || [];
    console.log(`Exported ${subscriptions?.length || 0} billing subscriptions`);

    // Billing Events
    console.log('Exporting billing_events...');
    const { data: events, error: eventsError } = await originalDb
      .from('billing_events')
      .select('*');
    if (eventsError) console.error('Error exporting billing_events:', eventsError);
    exportData.billing_events = events || [];
    console.log(`Exported ${events?.length || 0} billing events`);

    // Plans
    console.log('Exporting plans...');
    const { data: plans, error: plansError } = await originalDb
      .from('plans')
      .select('*');
    if (plansError) console.error('Error exporting plans:', plansError);
    exportData.plans = plans || [];
    console.log(`Exported ${plans?.length || 0} plans`);

    // Notifications
    console.log('Exporting notifications...');
    const { data: notifications, error: notifsError } = await originalDb
      .from('notifications')
      .select('*');
    if (notifsError) console.error('Error exporting notifications:', notifsError);
    exportData.notifications = notifications || [];
    console.log(`Exported ${notifications?.length || 0} notifications`);

    // Activity Logs
    console.log('Exporting activity_logs...');
    const { data: logs, error: logsError } = await originalDb
      .from('activity_logs')
      .select('*');
    if (logsError) console.error('Error exporting activity_logs:', logsError);
    exportData.activity_logs = logs || [];
    console.log(`Exported ${logs?.length || 0} activity logs`);

    console.log('Export completed successfully!');

    // Return summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      tables_exported: Object.keys(exportData).length,
      record_counts: Object.entries(exportData).reduce((acc, [key, value]) => {
        acc[key] = (value as any[]).length;
        return acc;
      }, {} as Record<string, number>),
      data: exportData
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
