import { useState, useMemo } from 'react';
import { Settings, Eye, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import FrenchInvoiceTemplate from '../components/templates/FrenchInvoiceTemplate';

const FrenchInvoiceDemo = () => {
  const { t } = useTranslation('common');
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    showInvoiceNumber: true,
    showDueDate: true,
    showOperationType: true,
    showOrderNumber: true,
    showSenderInfo: true,
    showReceiverInfo: true,
    showTotals: true,
    showPaymentInfo: true,
    showFooter: true,
    showNotes: true,
    showTerms: true,
    hideColumns: [],
    currency: '€'
  });

  const availableColumns = ['Date', 'Qty', 'Unit', 'VAT'];

  const handleColumnToggle = (column) => {
    setConfig(prev => ({
      ...prev,
      hideColumns: prev.hideColumns.includes(column)
        ? prev.hideColumns.filter(col => col !== column)
        : [...prev.hideColumns, column]
    }));
  };

  const handleLoadSampleData = () => {
    // Reset configuration to show all sections for better demonstration
    setConfig({
      showInvoiceNumber: true,
      showDueDate: true,
      showOperationType: true,
      showOrderNumber: true,
      showSenderInfo: true,
      showReceiverInfo: true,
      showTotals: true,
      showPaymentInfo: true,
      showFooter: true,
      showNotes: true,
      showTerms: true,
      hideColumns: [],
      currency: '€'
    });

    // Add visual feedback by temporarily highlighting the invoice
    const invoiceElement = document.querySelector('.invoice-container');
    if (invoiceElement) {
      invoiceElement.classList.add('transition-all', 'duration-1000');
      invoiceElement.style.transform = 'scale(1.02)';
      invoiceElement.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.3)';
      
      setTimeout(() => {
        invoiceElement.style.transform = 'scale(1)';
        invoiceElement.style.boxShadow = '';
      }, 1000);
    }
  };

  // Generate sample data based on current language
  const sampleInvoiceData = useMemo(() => {
    const isFrench = i18n.language === 'fr';
    
    return {
      number: 'FACT-2024-001',
      date: '2024-10-04',
      dueDate: '2024-11-04',
      operationType: t('invoiceTemplate.defaultOperationType'),
      orderNumber: 'CMD-2024-001',
      sender: {
        name: isFrench ? 'SwiftFacture SARL' : 'SwiftInvoice Ltd',
        address: isFrench ? '123 Rue de la République' : '123 Republic Street',
        postalCode: isFrench ? '75001' : '10001',
        city: isFrench ? 'Paris' : 'New York',
        phone: isFrench ? '+33 1 23 45 67 89' : '+1 234 567 8900',
        email: isFrench ? 'contact@swiftfacture.fr' : 'contact@swiftinvoice.com',
        siret: '12345678901234',
        tva: isFrench ? 'FR12345678901' : 'US123456789'
      },
      receiver: {
        name: isFrench ? 'Client Premium SARL' : 'Premium Customer Corp',
        address: isFrench ? '456 Avenue des Champs-Élysées' : '456 Champs-Elysees Avenue',
        postalCode: isFrench ? '69000' : '20001',
        city: isFrench ? 'Lyon' : 'Washington',
        phone: isFrench ? '+33 4 12 34 56 78' : '+1 202 123 4567',
        email: isFrench ? 'contact@clientpremium.fr' : 'contact@premiumcustomer.com'
      },
      items: [
        {
          description: isFrench ? 'Prestation de conseil en développement web' : 'Web development consulting services',
          date: '2024-10-01',
          quantity: 5,
          unit: isFrench ? 'heure' : 'hour',
          unitPrice: 80.00,
          vatRate: 20,
          amount: 400.00
        },
        {
          description: isFrench ? 'Formation personnalisée React/Next.js' : 'Custom React/Next.js training',
          date: '2024-10-02',
          quantity: 1,
          unit: isFrench ? 'journée' : 'day',
          unitPrice: 600.00,
          vatRate: 20,
          amount: 600.00
        },
        {
          description: isFrench ? 'Maintenance et support technique' : 'Technical maintenance and support',
          date: '2024-10-03',
          quantity: 3,
          unit: isFrench ? 'mois' : 'month',
          unitPrice: 150.00,
          vatRate: 20,
          amount: 450.00
        }
      ],
      payment: {
        bank: isFrench ? 'Banque Populaire' : 'Popular Bank',
        iban: isFrench ? 'FR76 1234 5678 9012 3456 789' : 'US12 3456 7890 1234 5678 90',
        bic: isFrench ? 'CCBPFRPPXXX' : 'POPBUSXXXX'
      },
      notes: t('invoiceTemplate.defaultNotes'),
      terms: t('invoiceTemplate.defaultTerms')
    };
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('frenchInvoiceDemo.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('frenchInvoiceDemo.subtitle')}
          </p>
        </div>

        {/* Settings Panel */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings size={16} />
              {showSettings ? t('frenchInvoiceDemo.buttons.hideSettings') : t('frenchInvoiceDemo.buttons.showSettings')}
            </button>
            
            <button
              onClick={handleLoadSampleData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText size={16} />
              {t('frenchInvoiceDemo.buttons.loadSampleData')}
            </button>
          </div>

          {showSettings && (
            <div className="mt-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.sections.customizationOptions')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Section Visibility */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">{t('frenchInvoiceDemo.sections.visibleSections')}</h4>
                  <div className="space-y-2">
                    {Object.entries({
                      showInvoiceNumber: t('frenchInvoiceDemo.fields.invoiceNumber'),
                      showDueDate: t('frenchInvoiceDemo.fields.dueDate'),
                      showOperationType: t('frenchInvoiceDemo.fields.operationType'),
                      showOrderNumber: t('frenchInvoiceDemo.fields.orderNumber'),
                      showSenderInfo: t('frenchInvoiceDemo.fields.senderInfo'),
                      showReceiverInfo: t('frenchInvoiceDemo.fields.receiverInfo'),
                      showTotals: t('frenchInvoiceDemo.fields.totalsSection'),
                      showPaymentInfo: t('frenchInvoiceDemo.fields.paymentInfo'),
                      showFooter: t('frenchInvoiceDemo.fields.footer'),
                      showNotes: t('frenchInvoiceDemo.fields.notes'),
                      showTerms: t('frenchInvoiceDemo.fields.terms')
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config[key]}
                          onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Column Visibility */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">{t('frenchInvoiceDemo.sections.tableColumns')}</h4>
                  <div className="space-y-2">
                    {availableColumns.map(column => (
                      <label key={column} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!config.hideColumns.includes(column)}
                          onChange={() => handleColumnToggle(column)}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {column === 'Date' && t('frenchInvoiceDemo.fields.date')}
                          {column === 'Qty' && t('frenchInvoiceDemo.fields.quantity')}
                          {column === 'Unit' && t('frenchInvoiceDemo.fields.unit')}
                          {column === 'VAT' && t('frenchInvoiceDemo.fields.vat')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Format Options */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">{t('frenchInvoiceDemo.sections.formatOptions')}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('frenchInvoiceDemo.fields.currency')}
                      </label>
                      <select
                        value={config.currency}
                        onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="€">{t('frenchInvoiceDemo.currencies.euro')}</option>
                        <option value="$">{t('frenchInvoiceDemo.currencies.dollar')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">{t('frenchInvoiceDemo.sections.quickPresets')}</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      hideColumns: [],
                      showInvoiceNumber: true,
                      showDueDate: true,
                      showTotals: true,
                      showPaymentInfo: true
                    }))}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    {t('frenchInvoiceDemo.presets.complete')}
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      hideColumns: ['Date', 'Unit'],
                      showOperationType: false,
                      showOrderNumber: false
                    }))}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {t('frenchInvoiceDemo.presets.simplified')}
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      hideColumns: ['VAT'],
                      showPaymentInfo: false,
                      showTerms: false
                    }))}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    {t('frenchInvoiceDemo.presets.quote')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="invoice-container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={16} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('frenchInvoiceDemo.sections.preview')}</h3>
          </div>
          
          <FrenchInvoiceTemplate
            invoiceData={sampleInvoiceData}
            {...config}
            enablePdfExport={true}
          />
        </div>
      </div>
    </div>
  );
};

export default FrenchInvoiceDemo;