import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import RegistrationForm from '@/components/RegistrationForm';

const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Manual PWA Install Shortcut */}
      <div className="fixed top-6 right-6 z-40">
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            if (window.InstallPWAButton && window.InstallPWAButton.handleInstall) {
              window.InstallPWAButton.handleInstall();
            } else {
              alert('To install the app, use your browser menu or look for the install button in the main app interface.');
            }
          }}
          className="bg-gradient-to-br from-blue-500 to-orange-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:scale-105 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
          Install SwiftFacture
        </a>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('auth.createAccount', 'Create Your Account')}
            </h1>
            <p className="text-muted-foreground">
              {t('auth.joinToday', 'Join SwiftFacture today and start managing your invoices professionally')}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg border border-border p-6">
            <RegistrationForm 
              plan={{ id: 'free', name: t('premium.plans.free', 'Free'), monthly: 0 }}
              billing="monthly"
              onClose={() => navigate('/premium')}
            />
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                {t('buttons.signIn', 'Sign In')}
              </button>
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {t('auth.freeAccountIncludes', 'Your free account includes:')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('premium.features.limitedCustomers', '5 customers')}</li>
              <li>• {t('premium.features.limitedInvoices', '15 invoices/estimates per month')}</li>
              <li>• {t('premium.features.basicTemplates', 'Basic invoice templates')}</li>
              <li>• {t('premium.features.pdfExport', 'PDF export')}</li>
              <li>• {t('premium.features.emailSupport', 'Email support')}</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {t('auth.upgradeAnytime', 'You can upgrade to a premium plan anytime to unlock unlimited features.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;