import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  Crown,
  User,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Receipt,
  Clock,
  Download,
  History,
  BarChart3,
  FileText,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  DollarSign,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import { SubscriptionService } from '@/services/subscriptionService';
import { TrialService } from '@/services/trialService';
import { toast } from 'sonner';

const Billing = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [trialData, setTrialData] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState({
    invoices: { used: 0, limit: 15 },
    customers: { used: 0, limit: 5 },
    deliveries: { used: 0, limit: 0 }
  });
  const [countdownTime, setCountdownTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [analytics, setAnalytics] = useState({
    monthlyUsage: { invoices: 0, customers: 0, revenue: 0 },
    deviceUsage: { desktop: 65, mobile: 35 },
    featureUsage: { pdf: 45, email: 23, templates: 32 }
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    billingAlerts: true,
    usageWarnings: true,
    marketingEmails: false
  });

  useEffect(() => {
    const loadBillingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load subscription status
        const subResult = await SubscriptionService.checkSubscription();
        if (subResult.success) {
          setSubscriptionData(subResult);
        }

        // Load available plans
        const plansResult = await SubscriptionService.getPlans();
        if (plansResult.success) {
          setPlans(plansResult.plans);
        }

        // Load trial data
        const trialResult = await TrialService.checkAccess(user.id);
        setTrialData(trialResult);

        // Load usage data (mock for now - you can connect to real usage API)
        setUsage({
          invoices: { used: 12, limit: subscriptionData?.subscribed ? 999 : 15 },
          customers: { used: 3, limit: subscriptionData?.subscribed ? 999 : 5 },
          deliveries: { used: 8, limit: subscriptionData?.subscribed ? 36 : 0 }
        });

        // Load payment history (mock data)
        setPaymentHistory([
          { id: 1, date: '2024-10-01', amount: 19.99, status: 'paid', invoice: 'INV-001' },
          { id: 2, date: '2024-09-01', amount: 19.99, status: 'paid', invoice: 'INV-002' },
          { id: 3, date: '2024-08-01', amount: 19.99, status: 'paid', invoice: 'INV-003' }
        ]);

        // Load analytics data (mock)
        setAnalytics({
          monthlyUsage: { invoices: 45, customers: 12, revenue: 2450 },
          deviceUsage: { desktop: 65, mobile: 35 },
          featureUsage: { pdf: 45, email: 23, templates: 32 }
        });

      } catch (error) {
        console.error('Error loading billing data:', error);
        toast.error(t('errors.loadingFailed', 'Failed to load billing data'));
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [user, t]);

  // Countdown timer effect
  useEffect(() => {
    const calculateCountdown = () => {
      if (subscriptionData?.subscription_end) {
        const now = new Date().getTime();
        const targetDate = new Date(subscriptionData.subscription_end).getTime();
        const difference = targetDate - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setCountdownTime({ days, hours, minutes, seconds });
        }
      }
    };

    const interval = setInterval(calculateCountdown, 1000);
    calculateCountdown();

    return () => clearInterval(interval);
  }, [subscriptionData?.subscription_end]);

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

  // Helper functions
  const getPlanIcon = (planId) => {
    if (!planId || planId === 'free') return User;
    return Crown;
  };

  const getPlanColor = (planId) => {
    switch (planId?.toLowerCase()) {
      case 'starter': return 'bg-blue-500';
      case 'professional': case 'pro': return 'bg-purple-500';
      case 'enterprise': return 'bg-gold-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === 0 || limit === 999) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">{t('billing.loading', 'Loading billing information...')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Billing Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              {t('billing.title', 'Billing & Subscription')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('billing.subtitle', 'Manage your subscription, view usage, and control your billing preferences')}
            </p>
          </div>

          {/* Current Plan Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Plan Card */}
            <div className="lg:col-span-2">
              <Card className="relative overflow-hidden">
                {subscriptionData?.subscribed && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${getPlanColor(subscriptionData.plan_id)}`} />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        {React.createElement(getPlanIcon(subscriptionData?.plan_id), { className: "h-6 w-6" })}
                        {subscriptionData?.subscribed 
                          ? t(`subscription.${subscriptionData.plan_id}`, subscriptionData.plan_id || 'Premium')
                          : t('subscription.free', 'Free Plan')
                        }
                      </CardTitle>
                      <CardDescription className="text-base">
                        {subscriptionData?.subscribed
                          ? t('billing.planActive', 'Your subscription is active and all features are available')
                          : t('billing.planFree', 'You are currently on the free plan with limited features')
                        }
                      </CardDescription>
                    </div>
                    <Badge 
                      className={subscriptionData?.subscribed 
                        ? "bg-green-500 hover:bg-green-600 text-white" 
                        : "bg-gray-500 hover:bg-gray-600 text-white"
                      }
                    >
                      {subscriptionData?.subscribed ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> {t('billing.active', 'Active')}</>
                      ) : (
                        <><User className="w-3 h-3 mr-1" /> {t('billing.free', 'Free')}</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {subscriptionData?.subscribed ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {t('billing.renewsOn', 'Next billing date')}
                          </p>
                          <p className="text-lg font-semibold">
                            {subscriptionData.subscription_end 
                              ? new Date(subscriptionData.subscription_end).toLocaleDateString()
                              : t('billing.noRenewalDate', 'N/A')
                            }
                          </p>
                          {subscriptionData.subscription_end && (
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <div className="flex gap-1 text-sm font-mono">
                                <span className="bg-primary/10 px-2 py-1 rounded text-primary font-semibold">
                                  {countdownTime.days}d
                                </span>
                                <span className="bg-primary/10 px-2 py-1 rounded text-primary font-semibold">
                                  {String(countdownTime.hours).padStart(2, '0')}h
                                </span>
                                <span className="bg-primary/10 px-2 py-1 rounded text-primary font-semibold">
                                  {String(countdownTime.minutes).padStart(2, '0')}m
                                </span>
                                <span className="bg-primary/10 px-2 py-1 rounded text-primary font-semibold">
                                  {String(countdownTime.seconds).padStart(2, '0')}s
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Receipt className="h-4 w-4" />
                            {t('billing.planPrice', 'Monthly price')}
                          </p>
                          <p className="text-lg font-semibold">
                            {plans.find(p => p.id === subscriptionData.plan_id)?.price 
                              ? formatPrice(plans.find(p => p.id === subscriptionData.plan_id).price)
                              : t('billing.contactSupport', 'Contact Support')
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className="w-full"
                        size="lg"
                      >
                        {portalLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Settings className="mr-2 h-4 w-4" />
                        )}
                        {t('billing.manageSubscription', 'Manage Subscription')}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {t('billing.upgradeMessage', 'Upgrade to unlock unlimited features and premium support')}
                        </p>
                      </div>
                      <Button 
                        onClick={() => window.location.href = '/premium'}
                        className="w-full"
                        size="lg"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {t('billing.viewPlans', 'View Premium Plans')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Trial Info */}
            <div className="space-y-6">
              {/* Trial Card */}
              {trialData?.trial?.isTrialing && (
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                      <Zap className="h-5 w-5" />
                      {t('billing.trialActive', 'Free Trial')}
                    </CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">
                      {trialData.trial.daysLeft > 1
                        ? `${trialData.trial.daysLeft} days remaining`
                        : 'Last day of trial'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => window.location.href = '/premium'}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      {t('billing.upgradeNow', 'Upgrade Now')}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('billing.quickActions', 'Quick Actions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/premium'}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t('billing.changePlan', 'Change Plan')}
                  </Button>
                  {subscriptionData?.subscribed && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                    >
                      {portalLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      {t('billing.billingPortal', 'Billing Portal')}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/support'}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {t('billing.contactSupport', 'Contact Support')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('billing.usageStats', 'Usage Statistics')}
              </CardTitle>
              <CardDescription>
                {t('billing.usageDescription', 'Monitor your current usage and plan limits')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Invoices Usage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('billing.invoices', 'Invoices')}</span>
                    <span className="text-sm text-muted-foreground">
                      {usage.invoices.used}/{usage.invoices.limit === 999 ? '∞' : usage.invoices.limit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.invoices.used, usage.invoices.limit))}`}
                      style={{ width: `${getUsagePercentage(usage.invoices.used, usage.invoices.limit)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usage.invoices.limit === 999 
                      ? t('billing.unlimited', 'Unlimited') 
                      : `${usage.invoices.limit - usage.invoices.used} remaining this month`
                    }
                  </p>
                </div>

                {/* Customers Usage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('billing.customers', 'Customers')}</span>
                    <span className="text-sm text-muted-foreground">
                      {usage.customers.used}/{usage.customers.limit === 999 ? '∞' : usage.customers.limit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.customers.used, usage.customers.limit))}`}
                      style={{ width: `${getUsagePercentage(usage.customers.used, usage.customers.limit)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usage.customers.limit === 999 
                      ? t('billing.unlimited', 'Unlimited') 
                      : `${usage.customers.limit - usage.customers.used} remaining`
                    }
                  </p>
                </div>

                {/* Deliveries Usage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('billing.deliveries', 'Premium Deliveries')}</span>
                    <span className="text-sm text-muted-foreground">
                      {usage.deliveries.used}/{usage.deliveries.limit === 999 ? '∞' : usage.deliveries.limit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.deliveries.used, usage.deliveries.limit))}`}
                      style={{ width: `${getUsagePercentage(usage.deliveries.used, usage.deliveries.limit)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usage.deliveries.limit === 0 
                      ? t('billing.upgradeForDeliveries', 'Upgrade for deliveries')
                      : usage.deliveries.limit === 999 
                        ? t('billing.unlimited', 'Unlimited') 
                        : `${usage.deliveries.limit - usage.deliveries.used} remaining this month`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('billing.analytics', 'Monthly Analytics')}
                </CardTitle>
                <CardDescription>
                  {t('billing.analyticsDescription', 'Track your monthly performance and growth')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.monthlyUsage.invoices}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Invoices Created</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                    <User className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.monthlyUsage.customers}</p>
                    <p className="text-xs text-green-700 dark:text-green-300">New Customers</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${analytics.monthlyUsage.revenue}</p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Total Revenue</p>
                  </div>
                </div>

                {/* Device Usage */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Device Usage
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Desktop</span>
                      <span className="text-sm font-medium">{analytics.deviceUsage.desktop}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all"
                        style={{ width: `${analytics.deviceUsage.desktop}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mobile</span>
                      <span className="text-sm font-medium">{analytics.deviceUsage.mobile}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full transition-all"
                        style={{ width: `${analytics.deviceUsage.mobile}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  {t('billing.paymentHistory', 'Payment History')}
                </CardTitle>
                <CardDescription>
                  {t('billing.paymentDescription', 'View your recent billing transactions')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                          <CreditCardIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">${payment.amount}</p>
                          <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                        <Button variant="ghost" size="sm" className="mt-1">
                          <Download className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <History className="mr-2 h-4 w-4" />
                    View All History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('billing.featureUsage', 'Feature Usage')}
                </CardTitle>
                <CardDescription>
                  {t('billing.featureDescription', 'See which features you use most')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">PDF Generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${analytics.featureUsage.pdf}%` }} />
                      </div>
                      <span className="text-sm font-medium w-10">{analytics.featureUsage.pdf}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Email Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${analytics.featureUsage.email}%` }} />
                      </div>
                      <span className="text-sm font-medium w-10">{analytics.featureUsage.email}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Custom Templates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${analytics.featureUsage.templates}%` }} />
                      </div>
                      <span className="text-sm font-medium w-10">{analytics.featureUsage.templates}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('billing.notifications', 'Notification Preferences')}
                </CardTitle>
                <CardDescription>
                  {t('billing.notificationDescription', 'Manage your billing and usage alerts')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive billing updates via email</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        notifications.emailNotifications ? 'bg-primary' : 'bg-gray-200'
                      }`}
                      onClick={() => setNotifications(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Billing Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified before renewals</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        notifications.billingAlerts ? 'bg-primary' : 'bg-gray-200'
                      }`}
                      onClick={() => setNotifications(prev => ({ ...prev, billingAlerts: !prev.billingAlerts }))}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.billingAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Usage Warnings</p>
                      <p className="text-xs text-muted-foreground">Alert when approaching limits</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        notifications.usageWarnings ? 'bg-primary' : 'bg-gray-200'
                      }`}
                      onClick={() => setNotifications(prev => ({ ...prev, usageWarnings: !prev.usageWarnings }))}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.usageWarnings ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t('billing.quickActions', 'Quick Actions & Export')}
              </CardTitle>
              <CardDescription>
                {t('billing.actionsDescription', 'Export billing data and manage account settings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export Usage CSV
                </Button>
                <Button variant="outline" className="justify-start">
                  <Receipt className="mr-2 h-4 w-4" />
                  Download Receipts
                </Button>
                <Button variant="outline" className="justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Tax Settings
                </Button>
                <Button variant="outline" className="justify-start">
                  <CreditCardIcon className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          {!subscriptionData?.subscribed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  {t('billing.availablePlans', 'Available Plans')}
                </CardTitle>
                <CardDescription>
                  {t('billing.chooseDescription', 'Choose the perfect plan for your business needs')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.filter(plan => plan.id !== 'free').map(plan => (
                    <div key={plan.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-2">
                        <h3 className="font-semibold capitalize">{plan.name || plan.id}</h3>
                        <p className="text-2xl font-bold">{formatPrice(plan.price)}<span className="text-sm text-muted-foreground">/month</span></p>
                        <Button 
                          className="w-full" 
                          onClick={() => window.location.href = '/premium'}
                        >
                          {t('billing.selectPlan', 'Select Plan')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Warning */}
          {getUsagePercentage(usage.invoices.used, usage.invoices.limit) >= 80 && !subscriptionData?.subscribed && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('billing.usageWarning', 'You are approaching your plan limits. Consider upgrading to avoid service interruption.')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;