import { supabase } from '@/integrations/supabase/client';

export class SubscriptionService {
  /**
   * Check user's subscription status with Stripe
   */
  static async checkSubscription() {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return {
          success: false,
          subscribed: false,
          error: error.message
        };
      }

      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return {
        success: false,
        subscribed: false,
        error: error.message
      };
    }
  }

  /**
   * Create Stripe checkout session
   */
  static async createCheckout(priceId, planId) {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price_id: priceId, plan_id: planId }
      });

      if (error) {
        console.error('Error creating checkout:', error);
        return {
          success: false,
          error: error.message || 'Unknown error from Edge Function'
        };
      }
      
      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Exception in createCheckout:', error);
      
      return {
        success: false,
        error: error.message || 'Network or unexpected error'
      };
    }
  }

  /**
   * Open Stripe customer portal
   */
  static async openCustomerPortal() {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Error opening customer portal:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Error opening customer portal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get plan details from database with fallback handling
   */
  static async getPlans() {
    try {
      // First try with display_order for proper ordering
      let { data: plans, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false });

      // If display_order column doesn't exist, fallback to basic query
      if (error && error.message.includes('display_order')) {
        console.warn('display_order column not found, using fallback query');
        const fallbackResult = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });
          
        if (fallbackResult.error) {
          console.error('Error fetching plans (fallback):', fallbackResult.error);
          return { success: false, plans: [], error: fallbackResult.error.message };
        }
        
        plans = fallbackResult.data;
      } else if (error) {
        console.error('Error fetching plans:', error);
        return { success: false, plans: [], error: error.message };
      }

      // Ensure plans have required fields with defaults
      const processedPlans = (plans || []).map(plan => ({
        ...plan,
        display_order: plan.display_order || 0,
        stripe_price_id: plan.stripe_price_id || null,
        stripe_product_id: plan.stripe_product_id || null,
        max_customers: plan.max_customers || -1,
        max_invoices_per_month: plan.max_invoices_per_month || -1,
        max_premium_deliveries: plan.max_premium_deliveries || 0,
        features: plan.features || []
      }));

      return { success: true, plans: processedPlans };
    } catch (error) {
      console.error('Error fetching plans:', error);
      
      // Final fallback - return hardcoded plans if database fails
      const fallbackPlans = [
        {
          id: 'free',
          name_en: 'Free',
          name_fr: 'Gratuit', 
          description_en: 'Perfect for getting started',
          description_fr: 'Parfait pour commencer',
          price_monthly: 0,
          features: ['5 customers', '15 invoices/estimates per month', 'Basic templates'],
          display_order: 1,
          max_customers: 5,
          max_invoices_per_month: 15,
          max_premium_deliveries: 0
        },
        {
          id: 'starter',
          name_en: 'Starter',
          name_fr: 'Démarrage',
          description_en: 'Great for small businesses', 
          description_fr: 'Idéal pour les petites entreprises',
          price_monthly: 19.99,
          stripe_price_id: 'price_1SMPD4RogxYobEmxWT7P4zDG',
          stripe_product_id: 'prod_TJ1FKRu0auL1vc',
          features: ['30 customers', 'Unlimited invoices/estimates', '36 premium deliveries'],
          display_order: 2,
          max_customers: 30,
          max_invoices_per_month: -1,
          max_premium_deliveries: 36
        }
      ];
      
      return { success: true, plans: fallbackPlans, fallback: true };
    }
  }

  /**
   * Get specific plan details by ID
   */
  static async getPlan(planId) {
    try {
      const { data: plan, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching plan:', error);
        return { success: false, plan: null, error: error.message };
      }

      return { success: true, plan };
    } catch (error) {
      console.error('Error fetching plan:', error);
      return { success: false, plan: null, error: error.message };
    }
  }

  /**
   * Check user's current plan limits
   */
  static async checkPlanLimits(organizationId, featureType) {
    try {
      const { data, error } = await supabase.rpc('check_plan_usage', {
        user_org_id: organizationId,
        feature_type: featureType
      });

      if (error) {
        console.error('Error checking plan limits:', error);
        return { success: false, allowed: true }; // Default to allow if check fails
      }

      return { success: true, allowed: data };
    } catch (error) {
      console.error('Error checking plan limits:', error);
      return { success: false, allowed: true }; // Default to allow if check fails
    }
  }
}

export default SubscriptionService;
