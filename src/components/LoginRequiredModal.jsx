import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Lock, UserPlus, FileText, Receipt, Users, Calendar, Palette, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginRequiredModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get proper gradient classes
  const getGradientClass = (color) => {
    const gradients = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
      green: 'bg-gradient-to-r from-green-500 to-green-600',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
      pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
      indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    };
    return gradients[color] || gradients.indigo;
  };

  // Get feature name and description based on current path
  const getFeatureInfo = (path) => {
    switch (path) {
      case '/invoice':
        return {
          name: t('auth.features.invoice'),
          icon: FileText,
          description: t('auth.features.invoiceDesc'),
          color: 'blue'
        };
      case '/receipt':
        return {
          name: t('auth.features.receipt'),
          icon: Receipt,
          description: t('auth.features.receiptDesc'),
          color: 'green'
        };
      case '/customers':
        return {
          name: t('auth.features.customers'),
          icon: Users,
          description: t('auth.features.customersDesc'),
          color: 'purple'
        };
      case '/estimate':
        return {
          name: t('auth.features.estimate'),
          icon: Calendar,
          description: t('auth.features.estimateDesc'),
          color: 'orange'
        };
      case '/template':
        return {
          name: t('auth.features.template'),
          icon: Palette,
          description: t('auth.features.templateDesc'),
          color: 'pink'
        };
      default:
        return {
          name: t('auth.features.default'),
          icon: Lock,
          description: t('auth.features.defaultDesc'),
          color: 'indigo'
        };
    }
  };

  const feature = getFeatureInfo(location.pathname);
  const FeatureIcon = feature.icon;

  const handleLogin = () => {
    navigate('/login', { state: { from: location } });
  };

  const handleBackToDashboard = () => {
    navigate('/');
    onClose();
  };

  const handleClose = () => {
    // Redirect to login page when closing the modal
    navigate('/login', { state: { from: location } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-lg mx-4 shadow-2xl border-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with feature-specific styling */}
        <CardHeader className={`${getGradientClass(feature.color)} text-white pb-6`}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <FeatureIcon className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {t('auth.modal.title')}
              </CardTitle>
              <CardDescription className="text-white/90">
                {t('auth.modal.subtitle')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Feature-specific message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('auth.modal.accessTitle')} {feature.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {feature.description}
            </p>
          </div>

          {/* Benefits grid */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              {t('auth.modal.benefitsTitle')}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{t('auth.benefits.create')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{t('auth.benefits.manage')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">{t('auth.benefits.track')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">{t('auth.benefits.templates')}</span>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Shield className="w-3 h-3" />
              <span>{t('auth.trust.secure')}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Zap className="w-3 h-3" />
              <span>{t('auth.trust.fast')}</span>
            </div>
            <div className="text-xs text-gray-600">
              {t('auth.trust.free')}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('auth.modal.signInButton')}
            </Button>
            <Button 
              onClick={handleBackToDashboard}
              variant="outline" 
              className="w-full"
            >
              {t('auth.modal.backButton')}
            </Button>
          </div>

          {/* Quick note */}
          <p className="text-xs text-center text-gray-500">
            {t('auth.modal.note')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginRequiredModal;