import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const getPlanData = (t) => [
  {
    id: "free",
    name: t('premium.plans.free'),
    monthly: 0,
    features: [
      `5 ${t('premium.features.customers')}`,
      `15 ${t('premium.features.invoicesEstimates')}`,
      t('premium.features.premiumDeliveriesNotIncluded'),
      t('premium.features.androidIosApps'),
    ],
  },
  {
    id: "starter",
    name: t('premium.plans.starter'),
    monthly: 9.99,
    features: [
      `30 ${t('premium.features.customers')}`,
      t('premium.features.unlimitedInvoicesEstimates'),
      `36 ${t('premium.features.premiumDeliveries')}`,
      t('premium.features.androidIosApps'),
      t('premium.features.convertEstimates'),
    ],
  },
  {
    id: "pro",
    name: t('premium.plans.pro'),
    monthly: 17.99,
    features: [
      t('premium.features.unlimitedCustomers'),
      t('premium.features.unlimitedInvoicesEstimates'),
      `120 ${t('premium.features.premiumDeliveries')}`,
      t('premium.features.androidIosApps'),
      t('premium.features.timeTracking'),
      t('premium.features.recurringInvoices'),
    ],
  },
  {
    id: "growth",
    name: t('premium.plans.growth'),
    monthly: 41.99,
    features: [
      t('premium.features.unlimitedCustomers'),
      t('premium.features.unlimitedInvoicesEstimates'),
      `360 ${t('premium.features.premiumDeliveries')}`,
      t('premium.features.androidIosApps'),
      t('premium.features.paymentSchedules'),
      t('premium.features.multipleTradeNames'),
    ],
  },
];

const getFeaturesLeft = (t) => [
  {
    title: t('premium.services.sendInvoicesByPost.title'),
    desc: t('premium.services.sendInvoicesByPost.desc'),
  },
  {
    title: t('premium.services.sendPaymentReminders.title'),
    desc: t('premium.services.sendPaymentReminders.desc'),
  },
  {
    title: t('premium.services.convertEstimatesToInvoices.title'),
    desc: t('premium.services.convertEstimatesToInvoices.desc'),
  },
  {
    title: t('premium.services.improveCashFlow.title'),
    desc: t('premium.services.improveCashFlow.desc'),
  },
  {
    title: t('premium.services.freeTrialMonthly.title'),
    desc: t('premium.services.freeTrialMonthly.desc'),
  },
];

const getFeaturesRight = (t) => [
  {
    title: t('premium.services.sendEInvoices.title'),
    desc: t('premium.services.sendEInvoices.desc'),
  },
  {
    title: t('premium.services.timeTracking.title'),
    desc: t('premium.services.timeTracking.desc'),
  },
  {
    title: t('premium.services.multipleTradeNames.title'),
    desc: t('premium.services.multipleTradeNames.desc'),
  },
  {
    title: t('premium.services.increaseCustomerDatabase.title'),
    desc: t('premium.services.increaseCustomerDatabase.desc'),
  },
  {
    title: t('premium.services.frequentImprovements.title'),
    desc: t('premium.services.frequentImprovements.desc'),
  },
];

const Premium = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [billing, setBilling] = useState("yearly"); // 'yearly' or 'monthly'
  const { t } = useTranslation('common');
  
  // Get translated data
  const plans = getPlanData(t);
  const featuresLeft = getFeaturesLeft(t);
  const featuresRight = getFeaturesRight(t);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return (
     
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary border-orange-600"></div>
        </div>
   
    );
  }
  return (
    <main className="container mx-auto px-4 py-12">
      <section className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold">
          {billing === "yearly"
            ? t('premium.title.yearly')
            : t('premium.title.monthly')}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {billing === "yearly"
            ? t('premium.subtitle.yearly')
            : t('premium.subtitle.monthly')}
        </p>
      </section>

      <section className="mt-10">
        <div className="bg-background border border-border rounded-xl p-1 flex items-center gap-1">
          <button
            onClick={() => setBilling("yearly")}
            className={`flex-1 text-center py-3 px-4 rounded-lg transition-all duration-300 ${
              billing === "yearly"
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg transform scale-105"
                : "text-muted-foreground bg-transparent hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {billing === "yearly" && (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {t('premium.billing.yearly')}
            </span>
          </button>

          <button
            onClick={() => setBilling("monthly")}
            className={`flex-1 text-center py-3 px-4 rounded-lg transition-all duration-300 ${
              billing === "monthly"
                ? "bg-gradient-to-r from-blue-500 to-indigo-900 text-white font-bold shadow-lg transform scale-105"
                : "text-muted-foreground bg-transparent hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {billing === "monthly" && (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {t('premium.billing.monthly')}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {plans.map((p, idx) => (
            <div
              key={p.name}
              className={`rounded-lg border border-border p-6 bg-card ${
                idx === 2 ? "relative" : ""
              }`}
            >
              {idx === 2 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary px-3 py-1 text-xs font-semibold rounded-b">
                  {t('common.mostPopular')}
                </div>
              )}
              <div className="text-sm font-semibold text-muted-foreground">
                {p.name}
              </div>
              <div className="mt-4 text-3xl font-extrabold text-foreground">
                {billing === "monthly"
                  ? `${p.monthly.toFixed(2)} €`
                  : `${(p.monthly * 12 * 0.85).toFixed(2)} €`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('common.pricePerMonth')}
              </div>

              {billing === "yearly" && (
                <div className="mt-2 text-xs text-muted-foreground">{`${(
                  p.monthly * 12
                ).toFixed(2)} € paid once per year — now ${(
                  p.monthly *
                  12 *
                  0.85
                ).toFixed(2)} € (15% off)`}</div>
              )}

              <div className="mt-6">
                {billing === "monthly" ? (
                  <button
                    onClick={() => navigate("/account")}
                    className="w-full py-2 rounded-full border border-primary text-primary font-semibold"
                  >
                    {t('buttons.startFreeTrial')}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/account")}
                    className="w-full py-2 rounded-full bg-primary text-primary-foreground font-semibold"
                  >
                    {t('buttons.upgrade')}
                  </button>
                )}
              </div>

              <ul className="mt-6 text-sm space-y-3 text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold">{t('premium.services.title')}</h3>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {featuresLeft.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    📄
                  </div>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {featuresRight.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    📦
                  </div>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 text-xs text-muted-foreground">
        <p>
          {t('premium.vatDisclaimer')}
        </p>
      </section>
    </main>
  );
};

export default Premium;
