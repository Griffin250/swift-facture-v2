import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Download, Save, ArrowLeft, FileText, ChevronDown, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FrenchInvoiceForm from '../components/french-invoice/FrenchInvoiceForm';
import FrenchInvoicePreview from '../components/french-invoice/FrenchInvoicePreview';
import { calculateInvoiceTotals } from '../utils/frenchInvoiceCalculations';
import { frenchInvoiceService } from '../services/frenchInvoiceService';
import { customerService } from '../services/customerService';
import '../styles/french-invoice.css';
import FrenchInvoiceCTA from '@/components/FrenchInvoiceCTA';

const FrenchInvoicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const printRef = useRef();
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Invoice data state - Empty by default with placeholders from sample data
  const [invoiceData, setInvoiceData] = useState({
    // Company Information (Sender)
    company: {
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      website: '',
      logo: '' // No default logo - user can add one if needed
    },
    
    // Client Information (Receiver)
    client: {
      name: '',
      address: '',
      city: '',
      phone: ''
    },
    
    // Invoice Details
    invoice: {
      number: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      operationType: 'Livraison de marchandises'
    },
    
    // Line Items - Empty by default
    items: [{
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 20
    }],
    
    // Payment Information
    payment: {
      showPaymentInfo: true,
      bank: '',
      iban: '',
      bic: ''
    },

    // Template Settings
    settings: {
      showLogo: true,
      colorScheme: 'blue',
      fontSize: 'normal'
    },

    // Footer Settings
    footer: {
      showFooter: true,
      companyName: '',
      address: '',
      customMessage: ''
    }
  });

  // Calculate totals automatically
  const totals = calculateInvoiceTotals(invoiceData.items);

  // Update invoice data
  const handleDataChange = (newData) => {
    setInvoiceData(newData);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setInvoiceData(prev => ({
      ...prev,
      client: {
        name: customer?.name || '',
        address: customer?.address || '',
        city: customer?.city || '',
        phone: customer?.phone || ''
      }
    }));
  };

  // Handle PDF export
  const handlePDFExport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      if (printRef.current) {
        // Temporarily remove any scaling for PDF generation
        const previewContainer = printRef.current.closest('[style*="transform"]');
        const originalTransform = previewContainer?.style.transform;
        if (previewContainer) {
          previewContainer.style.transform = 'none';
        }

        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794, // A4 width at 96 DPI (210mm = 794px)
          height: 1123 // A4 height at 96 DPI (297mm = 1123px)
        });
        
        // Restore original transform
        if (previewContainer && originalTransform) {
          previewContainer.style.transform = originalTransform;
        }
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Calculate proper dimensions maintaining aspect ratio
        const imgWidth = pdfWidth;
        const imgHeight = Math.min(pdfHeight, (canvas.height * pdfWidth) / canvas.width);
        
        // Center the image if it's shorter than A4 height
        const yOffset = (pdfHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', 0, Math.max(0, yOffset), imgWidth, imgHeight);
        pdf.save(`Facture-${invoiceData.invoice.number || 'Invoice'}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF: ' + error.message);
    }
  };

  // Load sample data function
  const loadSampleData = () => {
    const sampleData = {
      company: {
        name: 'SWIFTFACTURE LTD',
        address: '123 Avenue des Entrepreneurs',
        city: '75008 PARIS',
        phone: '01 42 86 50 30',
        email: 'contact@swiftfacture.com',
        website: 'www.swiftfacture.com',
        logo: '/assets/logo/WebsiteLogo.png' // SwiftFacture website logo
      },
      
      client: {
        name: 'IT PERFECT LTD',
        address: '456 Rue de l\'Innovation',
        city: '69000 LYON',
        phone: '04 72 00 00 00'
      },
      
      invoice: {
        number: 'SF-2025-001',
        date: '2025-10-13', // Will display as 13/10/2025
        dueDate: '2025-11-12', // Will display as 12/11/2025 (30 days later)
        operationType: 'Prestation de services'
      },
      
      items: [
        {
          id: '1',
          description: 'Développement solution de facturation personnalisée',
          quantity: 40,
          unitPrice: 85.00,
          vatRate: 20
        },
        {
          id: '2',
          description: 'Formation utilisateurs et support technique',
          quantity: 8,
          unitPrice: 120.00,
          vatRate: 20
        },
        {
          id: '3',
          description: 'Maintenance et mises à jour (3 mois)',
          quantity: 1,
          unitPrice: 450.00,
          vatRate: 20
        }
      ],
      
      payment: {
        showPaymentInfo: true,
        bank: 'CRÉDIT AGRICOLE ÎLE-DE-FRANCE',
        iban: 'FR14 2004 1010 0505 0001 3M02 606',
        bic: 'AGRIFRPP'
      },

      settings: {
        showLogo: true,
        colorScheme: 'blue',
        fontSize: 'normal'
      },

      footer: {
        showFooter: true,
        companyName: 'SWIFTFACTURE LTD',
        address: '123 Avenue des Entrepreneurs 75008 PARIS',
        customMessage: 'Merci pour votre confiance. Paiement à 30 jours. En cas de retard, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée.'
      }
    };
    
    setInvoiceData(sampleData);
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!invoiceData.invoice.number?.trim()) {
        toast.error(t('frenchInvoice.validation.required') + ': ' + t('frenchInvoice.invoice.number'));
        setIsSaving(false);
        return;
      }

      if (!invoiceData.company.name?.trim()) {
        toast.error(t('frenchInvoice.validation.required') + ': ' + t('frenchInvoice.company.name'));
        setIsSaving(false);
        return;
      }

      if (!invoiceData.client.name?.trim()) {
        toast.error(t('frenchInvoice.validation.required') + ': ' + t('frenchInvoice.client.name'));
        setIsSaving(false);
        return;
      }

      // Create customer if needed
      if (invoiceData.client.name && invoiceData.client.name.trim()) {
        try {
          const existingCustomers = await customerService.getCustomers();
          const customerExists = existingCustomers.some(c => 
            c.name.toLowerCase().trim() === invoiceData.client.name.toLowerCase().trim()
          );
          
          if (!customerExists) {
            await customerService.createCustomer({
              name: invoiceData.client.name,
              address: invoiceData.client.address || '',
              city: invoiceData.client.city || '',
              phone: invoiceData.client.phone || '',
              email: '' // French invoices don't have email field
            });
          }
        } catch (customerError) {
          console.error('Error handling customer:', customerError);
          // Don't fail the invoice save if customer creation fails
        }
      }

      // Save to database
      await frenchInvoiceService.createFrenchInvoice(invoiceData);
      
      // Show success message with action
      toast.success(t('frenchInvoice.messages.saveSuccess'), {
        action: {
          label: t('navigation.invoice', 'View Invoices'),
          onClick: () => navigate('/invoice')
        }
      });
      
      // Auto-navigate to invoice dashboard after successful save
      setTimeout(() => {
        navigate('/invoice');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(t('frenchInvoice.messages.saveError') + ': ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FrenchInvoiceCTA />
      {/* Header Toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-2 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Hide return button on small screens */}
              <button
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                {t('common.back', 'Retour')}
              </button>
              <div className="hidden md:block h-6 w-px bg-gray-300" />
              {/* Hide title on small screens */}
              <h1 className="hidden md:block text-xl font-semibold text-gray-900">
                {t('frenchInvoice.title')}
              </h1>
              {/* Show compact title on small screens */}
              <h1 className="md:hidden text-lg font-semibold text-gray-900 truncate">
                {t('frenchInvoice.shortTitle', 'Facture FR')}
              </h1>
            </div>

            {/* Responsive actions */}
            <div className="flex items-center gap-2">
              {/* Always visible - toggle preview/edit */}
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isPreviewMode 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="hidden sm:inline">
                  {isPreviewMode ? t('frenchInvoice.editMode') : t('frenchInvoice.previewMode')}
                </span>
              </button>

              {/* Desktop actions - visible on medium screens and up */}
              <div className="hidden md:flex items-center gap-2">
                {/* Sample data */}
                <button
                  onClick={loadSampleData}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  <FileText size={16} />
                  <span className="hidden lg:inline">
                    {t('frenchInvoice.loadSampleData', 'Charger données exemple')}
                  </span>
                </button>
                
                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  <Save size={16} />
                  {isSaving ? t('frenchInvoice.saving') : t('frenchInvoice.save')}
                </button>
                
                {/* View invoices */}
                <button
                  onClick={() => navigate('/invoice')}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <FileText size={16} />
                  <span className="hidden lg:inline">
                    {t('navigation.invoice', 'View Invoices')}
                  </span>
                </button>

                {/* PDF export */}
                <button
                  onClick={handlePDFExport}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>

              {/* Mobile actions dropdown */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MoreVertical size={16} />
                  <ChevronDown size={14} />
                </button>
                
                {showActionsDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActionsDropdown(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            loadSampleData();
                            setShowActionsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <FileText size={16} />
                          {t('frenchInvoice.loadSampleData', 'Données exemple')}
                        </button>
                        
                        <button
                          onClick={() => {
                            handleSave();
                            setShowActionsDropdown(false);
                          }}
                          disabled={isSaving}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-green-50 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save size={16} />
                          {isSaving ? t('frenchInvoice.saving') : t('frenchInvoice.save')}
                        </button>
                        
                        <button
                          onClick={() => {
                            navigate('/invoice');
                            setShowActionsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <FileText size={16} />
                          {t('navigation.invoice', 'Voir factures')}
                        </button>
                        
                        <button
                          onClick={() => {
                            handlePDFExport();
                            setShowActionsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Download size={16} />
                          {t('frenchInvoice.exportPDF', 'Exporter PDF')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto p-2 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 min-h-0">
          {/* Left Side - Form */}
          {!isPreviewMode && (
            <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
              <div className="p-4 flex-shrink-0">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('frenchInvoice.formTitle')}
                  </h2>
                  <p className="text-gray-600">
                    {t('frenchInvoice.formDescription')}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <FrenchInvoiceForm
                  invoiceData={invoiceData}
                  onDataChange={handleDataChange}
                  onSave={() => setIsSaving(true)}
                  onPreview={() => setIsPreviewMode(true)}
                  onCustomerSelect={handleCustomerSelect}
                />
              </div>
            </div>
          )}

          {/* Right Side - Preview */}
          <div className={`${isPreviewMode ? 'col-span-5' : 'xl:col-span-3'} flex flex-col min-h-0`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
              <div className="p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('invoicePreview')}
                  </h2>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {/* Print-ready preview - A4 centered container */}
                <div className="flex justify-center items-start min-h-full py-8">
                  <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white" style={{
                    width: '210mm',
                    minHeight: '297mm',
                    maxWidth: '100%',
                    transform: 'scale(0.8)', /* Scale down for better screen viewing */
                    transformOrigin: 'top center'
                  }}>
                    <div ref={printRef}>
                      <FrenchInvoicePreview
                        invoiceData={invoiceData}
                        totals={totals}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import ProtectedRoute from '../components/ProtectedRoute';

const ProtectedFrenchInvoicePage = () => (
  <ProtectedRoute>
    <FrenchInvoicePage />
  </ProtectedRoute>
);

export default ProtectedFrenchInvoicePage;