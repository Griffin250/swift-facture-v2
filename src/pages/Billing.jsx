import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, ExternalLink } from 'lucide-react';
import SubscriptionService from '@/services/subscriptionService';
import TrialService from '@/services/trialService';
import { toast } from 'sonner';

const Billing = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [trialData, setTrialData] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const loadBillingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const subResult = await SubscriptionService.checkSubscription();
        if (subResult.success) {
          setSubscriptionData(subResult);
        }

        const trialResult = await TrialService.checkAccess(user.id);
        setTrialData(trialResult);
      } catch (error) {
        console.error('Error loading billing data:', error);
        toast.error(t('errors.loadingFailed', 'Failed to load billing data'));
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [user, t]);

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const result = await SubscriptionService.openCustomerPortal();
      
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error(t('errors.portalFailed', 'Failed to open billing portal'));
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error(t('errors.portalFailed', 'Failed to open billing portal'));
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('billing.title', 'Billing & Subscription')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('billing.subtitle', 'Manage your subscription and billing information')}
          </p>
        </div>

        {subscriptionData?.subscribed && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('billing.currentPlan', 'Current Plan')}
                  </CardTitle>
                  <CardDescription>
                    {t('billing.planDescription', 'Your active subscription details')}
                  </CardDescription>
                </div>
                <Badge className="bg-green-500 text-white">
                  {t('billing.active', 'Active')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('billing.plan', 'Plan')}</p>
                  <p className="text-lg font-semibold capitalize">
                    {subscriptionData.plan_id || 'Premium'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t('billing.renewsOn', 'Renews on')}
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full"
              >
                {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('billing.manageSubscription', 'Manage Subscription')}
              </Button>
            </CardContent>
          </Card>
        )}

        {trialData?.trial?.isTrialing && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="text-orange-900 dark:text-orange-100">
                {t('billing.trialActive', 'Free Trial Active')}
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                {trialData.trial.daysLeft > 1
                  ? t('trial.daysLeft', { days: trialData.trial.daysLeft })
                  : t('trial.lastDay', 'Last day of trial')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/premium'}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {t('billing.upgradeNow', 'Upgrade Now')}
              </Button>
            </CardContent>
          </Card>
        )}

        {!subscriptionData?.subscribed && !trialData?.trial?.isTrialing && (
          <Card>
            <CardHeader>
              <CardTitle>{t('billing.noSubscription', 'No Active Subscription')}</CardTitle>
              <CardDescription>
                {t('billing.noSubscriptionDesc', 'Start your subscription to unlock all features')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/premium'}
                className="w-full"
              >
                {t('billing.viewPlans', 'View Plans')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Billing;
