import { supabase } from '@/integrations/supabase/client';

export class TrialService {
  /**
   * Start a free trial for a new user
   * Creates organization, adds user as owner, and starts trial
   */
  static async startFreeTrial(userId, userEmail, organizationName = null) {
    try {
      // Generate organization name from email if not provided
      const orgName = organizationName || `${userEmail.split('@')[0]}'s Organization`;
      const orgSlug = orgName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);

      // Use service role for server-side operations
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Step 1: Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug: orgSlug,
          owner_id: userId
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Step 2: Add user as organization member (owner)
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          organization_id: organization.id,
          user_id: userId,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Step 3: Create trial subscription
      const trialStart = new Date();
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 30); // 30-day trial

      const { data: subscription, error: subError } = await supabase
        .from('billing_subscriptions')
        .insert({
          organization_id: organization.id,
          plan_id: 'trial-30',
          status: 'trialing',
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString()
        })
        .select()
        .single();

      if (subError) throw subError;

      // Step 4: Log trial started event
      await this.logBillingEvent(organization.id, subscription.id, 'trial_started', {
        plan_id: 'trial-30',
        trial_days: 30,
        trial_end: trialEnd.toISOString()
      });

      return {
        success: true,
        organization,
        subscription,
        trial_end: trialEnd
      };
    } catch (error) {
      console.error('Error starting free trial:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has access to features
   */
  static async checkAccess(userId) {
    try {
      // Get user's organization and subscription
      const { data: orgMember, error } = await supabase
        .from('org_members')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            billing_subscriptions (
              id,
              plan_id,
              status,
              trial_start,
              trial_end,
              current_period_start,
              current_period_end,
              plans (
                id,
                name_en,
                name_fr,
                features
              )
            )
          )
        `)
        .eq('user_id', userId)
        .single();

      // If the tables don't exist yet or there's a database issue, return basic access
      if (error && (
        error.code === 'PGRST205' || 
        error.code === '500' ||
        error.message.includes('Could not find the table') ||
        error.message.includes('relation') && error.message.includes('does not exist') ||
        error.message.includes('Internal Server Error')
      )) {
        // Database migration not run yet or database issue - provide basic access silently
        console.warn('Database issue detected:', error.code, error.message);
        return {
          hasAccess: true,
          reason: 'database_issue',
          message: 'Database not ready, providing basic access',
          needsMigration: true
        };
      }

      if (error || !orgMember) {
        return {
          hasAccess: false,
          reason: 'no_organization',
          message: 'User is not part of any organization'
        };
      }

      const subscription = orgMember.organizations.billing_subscriptions[0];
      if (!subscription) {
        return {
          hasAccess: false,
          reason: 'no_subscription',
          message: 'No active subscription found'
        };
      }

      const now = new Date();
      const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;

      // Check access based on subscription status
      switch (subscription.status) {
        case 'active':
          return {
            hasAccess: true,
            subscription,
            organization: orgMember.organizations,
            plan: subscription.plans
          };

        case 'trialing':
          if (trialEnd && now <= trialEnd) {
            const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
            return {
              hasAccess: true,
              subscription,
              organization: orgMember.organizations,
              plan: subscription.plans,
              trial: {
                isTrialing: true,
                daysLeft,
                trialEnd
              }
            };
          } else {
            // Trial expired, update status
            await this.expireTrial(subscription.id, orgMember.organizations.id);
            return {
              hasAccess: false,
              reason: 'trial_expired',
              message: 'Trial period has ended',
              subscription,
              organization: orgMember.organizations
            };
          }

        case 'expired':
        case 'canceled':
          return {
            hasAccess: false,
            reason: subscription.status,
            message: `Subscription is ${subscription.status}`,
            subscription,
            organization: orgMember.organizations
          };

        default:
          return {
            hasAccess: false,
            reason: 'unknown_status',
            message: 'Unknown subscription status'
          };
      }
    } catch (error) {
      console.error('Error checking access:', error);
      return {
        hasAccess: false,
        reason: 'error',
        message: error.message
      };
    }
  }

  /**
   * Get all plans
   */
  static async getPlans() {
    try {
      const { data: plans, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      // If the tables don't exist yet, return empty array
      if (error && (
        error.code === 'PGRST205' || 
        error.message.includes('Could not find the table') ||
        error.message.includes('relation') && error.message.includes('does not exist')
      )) {
        // Database migration not run yet - return empty plans array silently
        return { success: true, plans: [], needsMigration: true };
      }

      if (error) throw error;
      return { success: true, plans };
    } catch (error) {
      // Only log actual errors, not table-not-exists issues
      if (error.code !== 'PGRST205' && !error.message.includes('Could not find the table')) {
        console.error('Error fetching plans:', error);
      }
      return { success: false, error: error.message, needsMigration: error.code === 'PGRST205' };
    }
  }

  /**
   * Expire a trial subscription
   */
  static async expireTrial(subscriptionId, organizationId) {
    try {
      // Update subscription status
      const { error: updateError } = await supabase
        .from('billing_subscriptions')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) throw updateError;

      // Log trial expired event
      await this.logBillingEvent(organizationId, subscriptionId, 'trial_expired', {
        expired_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error expiring trial:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get trial statistics for admin dashboard
   */
  static async getTrialStats() {
    try {
      // Get total active trials
      const { data: activeTrials, error: activeError } = await supabase
        .from('billing_subscriptions')
        .select('id, trial_end, organizations(name)')
        .eq('status', 'trialing');

      if (activeError) throw activeError;

      // Get trials expiring soon (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const expiringSoon = activeTrials?.filter(trial => 
        new Date(trial.trial_end) <= nextWeek
      ) || [];

      // Get conversion events
      const { data: conversions, error: conversionError } = await supabase
        .from('billing_events')
        .select('id, created_at')
        .eq('event_type', 'converted_to_paid')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (conversionError) throw conversionError;

      return {
        success: true,
        stats: {
          activeTrials: activeTrials?.length || 0,
          expiringSoon: expiringSoon.length,
          monthlyConversions: conversions?.length || 0,
          trials: activeTrials || []
        }
      };
    } catch (error) {
      console.error('Error fetching trial stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log billing events
   */
  static async logBillingEvent(organizationId, subscriptionId, eventType, eventData = {}) {
    try {
      const { error } = await supabase
        .from('billing_events')
        .insert({
          organization_id: organizationId,
          subscription_id: subscriptionId,
          event_type: eventType,
          event_data: eventData
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging billing event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send trial reminder emails (to be called by cron job)
   */
  static async sendTrialReminders() {
    try {
      const now = new Date();
      const reminderDays = [7, 2, 1]; // Days before expiry to send reminders

      for (const days of reminderDays) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + days);
        
        // Find trials expiring in X days
        const { data: expiringTrials, error } = await supabase
          .from('billing_subscriptions')
          .select(`
            id,
            trial_end,
            organizations (
              id,
              name,
              owner_id,
              org_members (
                user_id,
                users (
                  email
                )
              )
            )
          `)
          .eq('status', 'trialing')
          .gte('trial_end', targetDate.toISOString().split('T')[0])
          .lt('trial_end', new Date(targetDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (error) throw error;

        // Send reminder emails
        for (const trial of expiringTrials || []) {
          await this.sendReminderEmail(trial, days);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending trial reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send reminder email (placeholder - implement with your email service)
   */
  static async sendReminderEmail(trial, daysLeft) {
    try {
      // This is a placeholder - implement with your email service
      console.log(`Would send ${daysLeft}-day reminder to ${trial.organizations.name}`);
      
      // Log reminder sent event
      await this.logBillingEvent(
        trial.organizations.id,
        trial.id,
        'reminder_sent',
        { days_left: daysLeft, reminder_type: `${daysLeft}d` }
      );

      return { success: true };
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error: error.message };
    }
  }
}

export default TrialService;