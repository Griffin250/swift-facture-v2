import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      // Get organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        setLoading(false);
        return;
      }

      setOrganization(orgData);

      // Get subscription
      const { data: subData, error: subError } = await supabase
        .from('billing_subscriptions')
        .select('*')
        .eq('org_id', orgData.id)
        .single();

      if (!subError && subData) {
        setSubscription(subData);
        
        // Check if user has access
        const hasValidAccess = 
          subData.status === 'active' || 
          (subData.status === 'trialing' && new Date(subData.trial_end) > new Date());
        
        setHasAccess(hasValidAccess);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => {
    if (user) {
      fetchSubscription();
    }
  };

  return {
    subscription,
    organization,
    loading,
    hasAccess,
    refreshSubscription,
  };
};