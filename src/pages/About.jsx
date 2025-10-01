import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, FileText, Award, UserCheck, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getSteps = (t) => [
  { title: t('about.howItWorks.steps.create.title'), desc: t('about.howItWorks.steps.create.desc'), icon: FileText },
  { title: t('about.howItWorks.steps.customize.title'), desc: t('about.howItWorks.steps.customize.desc'), icon: Award },
  { title: t('about.howItWorks.steps.send.title'), desc: t('about.howItWorks.steps.send.desc'), icon: UserCheck }
];

const getFaqs = (t) => [
  { q: t('about.faq.dataStorage.q'), a: t('about.faq.dataStorage.a') },
  { q: t('about.faq.customizeTemplates.q'), a: t('about.faq.customizeTemplates.a') },
  { q: t('about.faq.pdfSecurity.q'), a: t('about.faq.pdfSecurity.a') }
];

const FeatureCard = ({ title, children, icon: Icon }) => (
  <div className="bg-card hover:shadow-elegant transition-smooth p-5 rounded-lg"> 
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{children}</div>
      </div>
    </div>
  </div>
);

const About = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('common');

  // Handle navigation with scroll to top
  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Get translated data
  const steps = getSteps(t);
  const faqs = getFaqs(t);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-xl bg-gradient-to-br from-card to-background p-8 shadow-elegant">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">{t('about.title')}</h1>
              <p className="mt-4 text-muted-foreground max-w-xl">{t('about.subtitle')}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => handleNavigation('/invoice')} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold">{t('buttons.createInvoice')}</button>
                <button onClick={() => handleNavigation('/receipt')} className="px-4 py-2 rounded-md border border-border text-muted-foreground">{t('buttons.openReceipt')}</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FeatureCard title={t('about.features.editableTemplates.title')} icon={FileText}>{t('about.features.editableTemplates.desc')}</FeatureCard>
              <FeatureCard title={t('about.features.pdfExport.title')} icon={Award}>{t('about.features.pdfExport.desc')}</FeatureCard>
              <FeatureCard title={t('about.features.autoCalculations.title')} icon={Clock}>{t('about.features.autoCalculations.desc')}</FeatureCard>
              <FeatureCard title={t('about.features.privacyFirst.title')} icon={UserCheck}>{t('about.features.privacyFirst.desc')}</FeatureCard>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-center">{t('about.howItWorks.title')}</h2>
        <p className="text-center text-muted-foreground mt-2">{t('about.howItWorks.subtitle')}</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.title} className="p-6 bg-card rounded-lg hover:translate-y-1 transition-smooth">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold">{t('about.tips.title')}</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-primary mt-1" /> <span>{t('about.tips.saveDrafts')}</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-primary mt-1" /> <span>{t('about.tips.clearDescriptions')}</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-primary mt-1" /> <span>{t('about.tips.verifyTaxCurrency')}</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">{t('about.faq.title')}</h3>
            <div className="mt-4 space-y-3">
              {faqs.map((f, idx) => (
                <div key={f.q} className="border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full text-left p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{f.q}</div>
                    </div>
                    <ChevronDown className={`h-5 w-5 transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`px-4 pb-4 transition-all ${openFaq === idx ? 'max-h-40' : 'max-h-0'} overflow-hidden text-muted-foreground`}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="rounded-lg bg-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold">{t('about.cta.title')}</div>
            <div className="text-sm text-muted-foreground">{t('about.cta.subtitle')}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleNavigation('/invoice')} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold">{t('buttons.createInvoice')}</button>
            <button onClick={() => handleNavigation('/premium')} className="px-4 py-2 rounded-md border border-border text-muted-foreground">{t('buttons.viewPricing')}</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
