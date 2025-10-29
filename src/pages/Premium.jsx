import { useState, useEffect } from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RegistrationForm from "@/components/RegistrationForm";
import { useAuth } from "@/contexts/AuthContext";

const getPlanData = (t) => [
  {
    id: "free",
    name: t('premium.plans.free', 'Free'),
    monthly: 0,
    features: [
      `5 ${t('premium.features.customers', 'customers')}`,
      `15 ${t('premium.features.invoicesEstimates', 'invoices/estimates per month')}`,
      t('premium.features.basicTemplates', 'Basic templates'),
      t('premium.features.pdfExport', 'PDF export'),
    ],
  },
  {
    id: "starter",
    name: t('premium.plans.starter', 'Starter'),
    monthly: 19.99,
    stripe_price_id: 'price_1SMQxBRogxYobEmxfmD1JSHO',
    features: [
      `30 ${t('premium.features.customers', 'customers')}`,
      t('premium.features.unlimitedInvoicesEstimates', 'Unlimited invoices/estimates'),
      `36 ${t('premium.features.premiumDeliveries', 'premium deliveries')}`,
      t('premium.features.emailSupport', 'Email support'),
      t('premium.features.convertEstimates', 'Convert estimates to invoices'),
    ],
  },
  {
    id: "pro",
    name: t('premium.plans.pro', 'Professional'),
    monthly: 39.99,
    stripe_price_id: 'price_1SMQytRogxYobEmxhMpXZUZe',
    features: [
      t('premium.features.unlimitedCustomers', 'Unlimited customers'),
      t('premium.features.unlimitedInvoicesEstimates', 'Unlimited invoices/estimates'),
      `120 ${t('premium.features.premiumDeliveries', 'premium deliveries')}`,
      t('premium.features.advancedReporting', 'Advanced reporting'),
      t('premium.features.prioritySupport', 'Priority support'),
      t('premium.features.apiAccess', 'API access'),
    ],
  },
  {
    id: "enterprise",
    name: t('premium.plans.enterprise', 'Enterprise'),
    monthly: 79.99,
    stripe_price_id: 'price_1SMR02RogxYobEmxopfcFYAa',
    features: [
      t('premium.features.unlimitedCustomers', 'Unlimited customers'),
      t('premium.features.unlimitedInvoicesEstimates', 'Unlimited invoices/estimates'),
      `360 ${t('premium.features.premiumDeliveries', 'premium deliveries')}`,
      t('premium.features.customBranding', 'Custom branding'),
      t('premium.features.dedicatedSupport', 'Dedicated support'),
      t('premium.features.multipleTradeNames', 'Multiple trade names'),
    ],
  },
];

const Premium = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [billing, setBilling] = useState("monthly");
  const { t } = useTranslation('common');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userAccess, setUserAccess] = useState(null);
  const [plans, setPlans] = useState([]);
  const [needsMigration, setNeedsMigration] = useState(false);
  const { user, userAccess: authAccess } = useAuth(); // Get both user and userAccess from useAuth
  
  const planData = getPlanData(t);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load plans from database using subscription service
        const { SubscriptionService } = await import('@/services/subscriptionService');
        const plansResult = await SubscriptionService.getPlans();
        
        if (plansResult.success && plansResult.plans.length > 0) {
          // Filter out trial plan from public display
          const publicPlans = plansResult.plans.filter(p => p.id !== 'trial-30');
          setPlans(publicPlans);
        } else {
          // Use fallback data if database fails
          setPlans(planData);
        }

        // Check user subscription status if logged in
        if (user) {
          try {
            const subscriptionResult = await SubscriptionService.checkSubscription();
            
            if (subscriptionResult.success && subscriptionResult.subscribed) {
              setUserAccess({
                hasAccess: true,
                plan: { id: subscriptionResult.plan_id },
                subscription: subscriptionResult
              });
            } else {
              // Check trial access through auth context
              if (authAccess?.hasAccess) {
                setUserAccess(authAccess);
              }
            }
          } catch (subError) {
            console.error('Error checking subscription status:', subError);
            // Don't fail the entire page load for subscription check errors
          }
        }
      } catch (error) {
        console.error('Error loading premium data:', error);
        setPlans(planData); // Fallback to static data
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSelectPlan = async (planData) => {
    // Find the original plan data with stripe_price_id
    const fullPlan = plans.find(p => p.id === planData.id) || planData;
    
    if (fullPlan.id === "free") {
      // Show registration dialog for free plan
      if (!user) {
        setSelectedPlan(fullPlan);
        setIsDialogOpen(true);
      }
      return;
    }

    if (!user) {
      // Show registration dialog for non-logged in users
      setSelectedPlan(fullPlan);
      setIsDialogOpen(true);
      return;
    }

    // Check if user already has a subscription
    if (userAccess?.subscription?.subscribed) {
      try {
        const { SubscriptionService } = await import('@/services/subscriptionService');
        const portalResult = await SubscriptionService.openCustomerPortal();
        
        if (portalResult.success && portalResult.url) {
          window.open(portalResult.url, '_blank');
        } else {
          alert(t('errors.customerPortalFailed', 'Unable to open subscription management. Please try again.'));
        }
      } catch (portalError) {
        console.error('Error opening customer portal:', portalError);
        alert(t('errors.customerPortalError', 'There was an error opening subscription management. Please try again.'));
      }
      return;
    }

    // For users without existing subscription, initiate Stripe checkout
    try {
      const { SubscriptionService } = await import('@/services/subscriptionService');
      
      const priceId = fullPlan.stripe_price_id;
      
      if (!priceId) {
        alert(t('errors.missingPriceId', 'This plan is not yet configured. Please contact support.'));
        return;
      }
      
      const result = await SubscriptionService.createCheckout(priceId, fullPlan.id);
      
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        alert(t('errors.checkoutFailed', `Failed to create checkout session: ${result.error || 'Unknown error'}`));
      }
    } catch (error) {
      console.error('Error in checkout flow:', error);
      alert(t('errors.checkoutFailed', `Failed to create checkout session: ${error.message}`));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary border-orange-600"></div>
      </div>
    );
  }

  // Use database plans if available, otherwise use fallback
  const displayPlans = plans.length > 0 ? plans : planData;

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Database Migration Notice */}
      {needsMigration && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <strong>Database setup required:</strong> The trial system tables need to be created. 
              Please run the migration in your Supabase dashboard to enable full functionality.
            </div>
            <div className="mt-2 text-sm">
              Copy and run the contents of <code className="bg-blue-100 px-1 rounded">FIXED_TRIAL_SYSTEM_MIGRATION.sql</code> in your Supabase SQL Editor.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Status Banner */}
      {userAccess?.trial?.isTrialing && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {userAccess.trial.daysLeft > 1 
              ? t('trial.daysLeft', { days: userAccess.trial.daysLeft })
              : t('trial.lastDay')
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t('premium.pageTitle', 'Choose Your Plan')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('premium.pageSubtitle', 'Select the perfect plan for your business needs')}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg flex">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billing === "monthly"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('billing.monthly', 'Monthly')}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billing === "yearly"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('billing.yearly', 'Yearly')}
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {t('billing.discount', '15% off')}
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayPlans.map((p, idx) => {
          // Normalize plan structure (database vs fallback)
          const plan = {
            id: p.id,
            name: p.name || p.name_en,
            monthly: p.monthly || p.price_monthly || 0,
            features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features) : [])
          };
          
          const isCurrentPlan = userAccess?.plan?.id === plan.id;
          const price = billing === "monthly" ? plan.monthly : (plan.monthly * 12 * 0.85);

          return (
            <div
              key={plan.id}
              className={`rounded-lg border border-border p-6 bg-card ${
                idx === 2 ? "relative border-primary" : ""
              }`}
            >
              {idx === 2 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded">
                  {t('common.mostPopular', 'Most Popular')}
                </div>
              )}
              
              <div className="text-lg font-semibold text-foreground mb-2">
                {plan.name}
              </div>
              
              <div className="text-3xl font-bold text-foreground mb-1">
                {plan.monthly === 0 ? (
                  t('pricing.free', 'Free')
                ) : (
                  `€${price.toFixed(2)}`
                )}
              </div>
              
              {plan.monthly > 0 && (
                <div className="text-sm text-muted-foreground mb-4">
                  {billing === "monthly" ? t('pricing.perMonth', 'per month') : t('pricing.perYear', 'per year')}
                </div>
              )}

              <div className="mb-6">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg bg-green-100 text-green-700 font-semibold cursor-not-allowed"
                  >
                    {t('buttons.currentPlan', 'Current Plan')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      idx === 2
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {plan.id === "free" || plan.id === "trial-30" ? t('buttons.signUp', 'Sign Up') : t('buttons.upgrade', 'Upgrade')}
                  </button>
                )}
              </div>

              <ul className="space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Registration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? `Get Started with ${selectedPlan.name}` : 'Get Started'}
            </DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <RegistrationForm 
              plan={selectedPlan}
              billing={billing}
              onClose={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Premium;