
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext({
  user: null,
  loading: true,
  userAccess: null,
  signOut: () => {},
  startTrial: () => {},
  checkAccess: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState(null);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('AuthContext loading timeout reached, forcing completion');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const checkAccess = async (userId = null) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setUserAccess(null);
        return null;
      }

      // Only check existing access, don't create anything automatically
      try {
        const { default: TrialService } = await import('@/services/trialService');
        const accessResult = await TrialService.checkExistingAccess(targetUserId);
        setUserAccess(accessResult);
        return accessResult;
      } catch (importError) {
        console.warn('TrialService not available:', importError.message);
        // Fallback - no access by default, user must choose
        const fallbackAccess = { hasAccess: false, isTrialActive: false };
        setUserAccess(fallbackAccess);
        return fallbackAccess;
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setUserAccess(null);
      return null;
    }
  };

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // Skip trial service check during initial load to prevent hanging
        // This will be handled by the auth state change listener
        
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setUserAccess(null);
      } finally {
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        // Don't auto-assign anything on sign-in
        // Users should explicitly choose their plan
        if (session?.user) {
          // Just set basic access without auto-creating trials
          setUserAccess({ hasAccess: false, isTrialActive: false });
        } else {
          setUserAccess(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserAccess(null);
  };

  const refreshUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        try {
          const { default: TrialService } = await import('@/services/trialService');
          const accessResult = await TrialService.checkAccess(currentUser.id);
          setUserAccess(accessResult);
        } catch (accessError) {
          console.warn('Trial service not available:', accessError);
          setUserAccess(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const startTrial = async (organizationName = null) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to start trial');
      }

      const { default: TrialService } = await import('@/services/trialService');
      const { default: EmailService } = await import('@/services/emailService');
      
      const result = await TrialService.startFreeTrial(
        user.id,
        user.email,
        organizationName
      );

      if (result.success) {
        // Send welcome email
        await EmailService.sendWelcomeEmail(
          user.email,
          result.organization.name,
          result.trial_end,
          'en' // TODO: Get user's preferred language
        );

        // Refresh user access
        const accessResult = await TrialService.checkAccess(user.id);
        setUserAccess(accessResult);
        
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    userAccess,
    signOut,
    refreshUser,
    checkAccess,
    startTrial,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};