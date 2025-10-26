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
          error: error.message
        };
      }

      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Error creating checkout:', error);
      return {
        success: false,
        error: error.message
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
   * Get plan details from database
   */
  static async getPlans() {
    try {
      const { data: plans, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        return { success: false, plans: [], error: error.message };
      }

      return { success: true, plans: plans || [] };
    } catch (error) {
      console.error('Error fetching plans:', error);
      return { success: false, plans: [], error: error.message };
    }
  }
}

export default SubscriptionService;
