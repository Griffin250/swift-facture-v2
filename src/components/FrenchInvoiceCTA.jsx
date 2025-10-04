import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from 'lucide-react';

const FrenchInvoiceCTA = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 my-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('frenchInvoiceCTA.title', 'Want a fully customizable invoice?')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('frenchInvoiceCTA.description', 'Try our professional French-style invoice template with advanced customization options, dynamic section visibility, and PDF export.')}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t('frenchInvoiceCTA.features.customizable', 'Fully Customizable')}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t('frenchInvoiceCTA.features.professional', 'Professional Style')}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {t('frenchInvoiceCTA.features.multilingual', 'Multilingual')}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {t('frenchInvoiceCTA.features.pdfExport', 'PDF Export')}
            </span>
          </div>
          <Button 
            onClick={() => navigate('/customizable-invoice')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('frenchInvoiceCTA.button', 'Try This Template')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FrenchInvoiceCTA;