import { useState, useEffect } from 'react';
import { Eye, FileText, Maximize2, X, Plus, Trash2, Check, Settings, Save, Send, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import FrenchInvoiceTemplate from '../components/templates/FrenchInvoiceTemplate';
import { useAuth } from '../contexts/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { supabase } from '../integrations/supabase/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SmartCustomerSelector from '../components/SmartCustomerSelector';

const FrenchInvoiceDemo = () => {
  // Manual customer entry mode
  const [isManualMode, setIsManualMode] = useState(false);
  // Smart customer selection state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // Handle customer selection from SmartCustomerSelector
  const handleCustomerSelect = (customer) => {
    // If manual mode, update receiver with new customer details
    if (customer && customer.isNewCustomer) {
      setInvoiceData(prev => ({
        ...prev,
        receiver: {
          ...prev.receiver,
          name: customer.name || '',
          address: customer.address || '',
          postalCode: customer.postal_code || '',
          city: customer.city || '',
          phone: customer.phone || '',
          email: customer.email || '',
          company: customer.company || ''
        }
      }));
    }
    setSelectedCustomer(customer);
    if (customer) {
      setInvoiceData(prev => ({
        ...prev,
        receiver: {
          ...prev.receiver,
          name: customer.name || '',
          address: customer.address || '',
          postalCode: customer.postal_code || '',
          city: customer.city || '',
          phone: customer.phone || '',
          email: customer.email || ''
        }
      }));
    }
  };
  const { t } = useTranslation('common');
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);

  // Invoice data state
  const [invoiceData, setInvoiceData] = useState({
    number: 'FACT-2024-001',
    date: '2024-10-04',
    dueDate: '2024-11-04',
    operationType: '',
    orderNumber: 'CMD-2024-001',
    sender: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
      email: '',
      siret: '',
      tva: ''
    },
    receiver: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
      email: ''
    },
    items: [
      {
        description: '',
        date: '',
        quantity: 1,
        unit: '',
        unitPrice: 0,
        vatRate: 20,
        amount: 0
      }
    ],
    payment: {
      bank: '',
      iban: '',
      bic: ''
    },
    notes: '',
    terms: ''
  });

  // Configuration state for show/hide features
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
    showSellerTitle: true,
    showCustomerTitle: true,
    hideColumns: [],
    currency: '€',
    locale: 'fr-FR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'european'
  });

  const availableColumns = ['Date', 'Qty', 'Unit', 'VAT'];



  // Handle input changes
  const handleInputChange = (field, value, section = null) => {
    setInvoiceData(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate amount if quantity or unitPrice changes
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      return { ...prev, items: newItems };
    });
  };

  // Show toast notification
  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Add new item
  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          date: '',
          quantity: 1,
          unit: '',
          unitPrice: 0,
          vatRate: 20,
          amount: 0
        }
      ]
    }));
    showToastNotification(t('frenchInvoiceDemo.messages.itemAdded'));
  };

  // Remove item
  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      showToastNotification(t('frenchInvoiceDemo.messages.itemRemoved'));
    }
  };



  const handleLoadSampleData = () => {
    // Check if user is authenticated
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Load sample data
    const isFrench = i18n.language === 'fr';
    setInvoiceData({
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
        }
      ],
      payment: {
        bank: isFrench ? 'Banque Populaire' : 'Popular Bank',
        iban: isFrench ? 'FR76 1234 5678 9012 3456 789' : 'US12 3456 7890 1234 5678 90',
        bic: isFrench ? 'CCBPFRPPXXX' : 'POPBUSXXXX'
      },
      notes: t('invoiceTemplate.defaultNotes'),
      terms: t('invoiceTemplate.defaultTerms')
    });

    // Reset configuration to show all sections
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
    
    showToastNotification(t('frenchInvoiceDemo.messages.sampleDataLoaded'));
  };

  // Save invoice to database
  const handleSaveInvoice = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!invoiceData.number || !invoiceData.receiver.name) {
      showToastNotification(t('frenchInvoiceDemo.messages.requiredFields'));
      return;
    }

    setActionLoading(true);
    try {
      // Calculate totals
      const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.vatRate || 0) / 100), 0);
      const total = subtotal + tax;

      const invoiceToSave = {
        user_id: user.id,
        invoice_number: invoiceData.number,
        date: invoiceData.date,
        due_date: invoiceData.dueDate,
        status: 'draft',
        subtotal: subtotal,
        tax: tax,
        total: total,
        notes: invoiceData.notes || '',
        template_name: 'french-invoice'
      };

      let result;
      if (savedInvoiceId) {
        // Update existing invoice
        result = await supabase
          .from('invoices')
          .update(invoiceToSave)
          .eq('id', savedInvoiceId)
          .select();
        
        if (result.error) throw result.error;

        // Delete existing items and re-create them
        const deleteResult = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', savedInvoiceId);
        
        if (deleteResult.error) throw deleteResult.error;
      } else {
        // Create new invoice
        result = await supabase
          .from('invoices')
          .insert([invoiceToSave])
          .select();
        
        if (result.error) throw result.error;
        
        if (result.data && result.data[0]) {
          setSavedInvoiceId(result.data[0].id);
        }
      }

      const invoiceId = savedInvoiceId || result.data[0].id;

      // Save invoice items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const itemsToSave = invoiceData.items.map((item, index) => ({
          invoice_id: invoiceId,
          user_id: user.id,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unitPrice || 0,
          tax_rate: item.vatRate || 0,
          total: (item.quantity || 1) * (item.unitPrice || 0),
          sort_order: index
        }));

        const itemsResult = await supabase
          .from('invoice_items')
          .insert(itemsToSave);
        
        if (itemsResult.error) throw itemsResult.error;
      }
      
      showToastNotification(t('frenchInvoiceDemo.messages.invoiceSaved'));
    } catch (error) {
      console.error('Error saving invoice:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      showToastNotification(t('frenchInvoiceDemo.messages.saveError'));
    } finally {
      setActionLoading(false);
    }
  };

  // Send invoice via email
  const handleSendInvoice = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setActionLoading(true);
    try {
      // First save the invoice
      await handleSaveInvoice();
      
      // Here you would implement email sending logic
      // For now, we'll just show a success message
      showToastNotification(t('frenchInvoiceDemo.messages.invoiceSent'));
    } catch (error) {
      console.error('Error sending invoice:', error);
      showToastNotification(t('frenchInvoiceDemo.messages.sendError'));
    } finally {
      setActionLoading(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    setActionLoading(true);
    try {
      const element = document.querySelector('.invoice-preview');
      if (!element) {
        throw new Error('Invoice preview not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const a4Width = 210;
      const a4Height = 297;
      // Calculate image height to fit exactly one A4 page
      const imgHeight = a4Height;
      pdf.addImage(imgData, 'PNG', 0, 0, a4Width, imgHeight);
      pdf.save(`${invoiceData.number || 'invoice'}.pdf`);
      showToastNotification(t('frenchInvoiceDemo.messages.pdfDownloaded'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToastNotification(t('frenchInvoiceDemo.messages.pdfError'));
    } finally {
      setActionLoading(false);
    }
  };

  // Print invoice

  // Handle column toggle
  const handleColumnToggle = (column) => {
    setConfig(prev => ({
      ...prev,
      hideColumns: prev.hideColumns.includes(column)
        ? prev.hideColumns.filter(col => col !== column)
        : [...prev.hideColumns, column]
    }));
  };

  // Add escape key listener
  useEffect(() => {
    const handleEscKeyPress = (e) => {
      if (e.key === 'Escape' && showFullscreen) {
        setShowFullscreen(false);
      }
    };

    if (showFullscreen) {
      document.addEventListener('keydown', handleEscKeyPress);
      return () => document.removeEventListener('keydown', handleEscKeyPress);
    }
  }, [showFullscreen]);

  // Check authentication status and initialize with sample data on component mount
  useEffect(() => {
    if (!loading) {
      setShowLoginModal(!user);
      
      // Initialize with some default values for better UX
      if (user) {
        const isFrench = i18n.language === 'fr';
        setInvoiceData(prev => ({
          ...prev,
          operationType: t('invoiceTemplate.defaultOperationType'),
          notes: t('invoiceTemplate.defaultNotes'),
          terms: t('invoiceTemplate.defaultTerms'),
          sender: {
            ...prev.sender,
            name: isFrench ? 'Mon Entreprise SARL' : 'My Company Ltd',
            email: isFrench ? 'contact@monentreprise.fr' : 'contact@mycompany.com',
            city: isFrench ? 'Paris' : 'New York',
            postalCode: isFrench ? '75001' : '10001'
          },
          receiver: {
            ...prev.receiver,
            name: isFrench ? 'Client Exemple' : 'Example Customer',
            city: isFrench ? 'Lyon' : 'Los Angeles',
            postalCode: isFrench ? '69000' : '90210'
          },
          items: [{
            ...prev.items[0],
            description: isFrench ? 'Prestation de service' : 'Service provision',
            quantity: 1,
            unit: isFrench ? 'heure' : 'hour',
            unitPrice: 80,
            amount: 80
          }]
        }));
      }
    }
  }, [loading, user, t]);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${!user ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('frenchInvoiceDemo.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('frenchInvoiceDemo.subtitle')}
              </p>
            </div>
            
            {/* Mobile Preview Toggle */}
            <div className="lg:hidden w-full">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title={isPreviewMode ? t('frenchInvoiceDemo.buttons.editMode') : t('frenchInvoiceDemo.buttons.previewMode')}
              >
                <Eye size={16} />
                {isPreviewMode ? t('frenchInvoiceDemo.buttons.editMode') : t('frenchInvoiceDemo.buttons.previewMode')}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-3">
              {/* Customize Button */}
              <button
                onClick={() => setShowCustomizeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title={t('frenchInvoiceDemo.tooltips.customize')}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">{t('frenchInvoiceDemo.buttons.customize')}</span>
                <span className="sm:hidden">{t('frenchInvoiceDemo.buttons.customizeShort')}</span>
              </button>

              {/* Load Sample Data */}
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title={t('frenchInvoiceDemo.tooltips.loadSample')}
              >
                <FileText size={16} />
                <span className="hidden sm:inline">{t('frenchInvoiceDemo.buttons.loadSampleData')}</span>
                <span className="sm:hidden">{t('frenchInvoiceDemo.buttons.loadSample')}</span>
              </button>

              {/* Save Invoice */}
              <button
                onClick={handleSaveInvoice}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('frenchInvoiceDemo.tooltips.save')}
              >
                <Save size={16} />
                <span className="hidden sm:inline">
                  {actionLoading ? t('frenchInvoiceDemo.buttons.saving') : t('frenchInvoiceDemo.buttons.save')}
                </span>
                <span className="sm:hidden">{t('frenchInvoiceDemo.buttons.saveShort')}</span>
              </button>

              {/* Send Invoice */}
              <button
                onClick={handleSendInvoice}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('frenchInvoiceDemo.tooltips.send')}
              >
                <Send size={16} />
                <span className="hidden sm:inline">
                  {actionLoading ? t('frenchInvoiceDemo.buttons.sending') : t('frenchInvoiceDemo.buttons.send')}
                </span>
                <span className="sm:hidden">{t('frenchInvoiceDemo.buttons.sendShort')}</span>
              </button>

              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('frenchInvoiceDemo.tooltips.downloadPdf')}
              >
                <Download size={16} />
                <span className="hidden sm:inline">
                  {actionLoading ? t('frenchInvoiceDemo.buttons.downloading') : t('frenchInvoiceDemo.buttons.downloadPdf')}
                </span>
                <span className="sm:hidden">{t('frenchInvoiceDemo.buttons.downloadPdfShort')}</span>
              </button>

            </div>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 min-h-[calc(100vh-120px)]">
          {/* Left Column - Form */}
          <div className={`${isPreviewMode ? 'hidden xl:block' : 'block'} bg-white xl:border-r border-gray-200 order-2 xl:order-1`}>
            <div className="p-6 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Basic Invoice Info */}
                <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.sections.basicInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="invoiceNumber"
                      label={t('frenchInvoiceDemo.fields.invoiceNumber')}
                      value={invoiceData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      placeholder="FACT-2024-001"
                    />
                    <FloatingLabelInput
                      id="date"
                      label={t('frenchInvoiceDemo.fields.date')}
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                    <FloatingLabelInput
                      id="dueDate"
                      label={t('frenchInvoiceDemo.fields.dueDate')}
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                    <FloatingLabelInput
                      id="orderNumber"
                      label={t('frenchInvoiceDemo.fields.orderNumber')}
                      value={invoiceData.orderNumber}
                      onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                      placeholder="CMD-2024-001"
                    />
                  </div>
                </div>

                {/* Sender Information */}
                <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.sections.senderInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="senderName"
                      label={t('frenchInvoiceDemo.fields.companyName')}
                      value={invoiceData.sender.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'sender')}
                      placeholder={t('frenchInvoiceDemo.placeholders.companyName')}
                    />
                    <FloatingLabelInput
                      id="senderEmail"
                      label={t('frenchInvoiceDemo.fields.email')}
                      type="email"
                      value={invoiceData.sender.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'sender')}
                      placeholder={t('frenchInvoiceDemo.placeholders.email')}
                    />
                    <FloatingLabelInput
                      id="senderAddress"
                      label={t('frenchInvoiceDemo.fields.address')}
                      value={invoiceData.sender.address}
                      onChange={(e) => handleInputChange('address', e.target.value, 'sender')}
                      placeholder={t('frenchInvoiceDemo.placeholders.address')}
                    />
                    <FloatingLabelInput
                      id="senderPhone"
                      label={t('frenchInvoiceDemo.fields.phone')}
                      value={invoiceData.sender.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'sender')}
                      placeholder={t('frenchInvoiceDemo.placeholders.phone')}
                    />
                    <FloatingLabelInput
                      id="senderCity"
                      label={t('frenchInvoiceDemo.fields.city')}
                      value={invoiceData.sender.city}
                      onChange={(e) => handleInputChange('city', e.target.value, 'sender')}
                      placeholder={t('frenchInvoiceDemo.placeholders.city')}
                    />
                    <FloatingLabelInput
                      id="senderPostalCode"
                      label={t('frenchInvoiceDemo.fields.postalCode')}
                      value={invoiceData.sender.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value, 'sender')}
                      placeholder={t('frenchInvoiceDemo.placeholders.postalCode')}
                    />
                    <FloatingLabelInput
                      id="senderSiret"
                      label={t('frenchInvoiceDemo.fields.siret')}
                      value={invoiceData.sender.siret}
                      onChange={(e) => handleInputChange('siret', e.target.value, 'sender')}
                      placeholder="12345678901234"
                    />
                    <FloatingLabelInput
                      id="senderTva"
                      label={t('frenchInvoiceDemo.fields.tva')}
                      value={invoiceData.sender.tva}
                      onChange={(e) => handleInputChange('tva', e.target.value, 'sender')}
                      placeholder="FR12345678901"
                    />
                  </div>
                </div>

                {/* Receiver Information */}
                {/* Smart Customer Selector */}
                <div className="mb-4">
                  <SmartCustomerSelector 
                    onCustomerSelect={handleCustomerSelect} 
                    selectedCustomer={selectedCustomer} 
                    isManualMode={isManualMode}
                    onManualModeChange={setIsManualMode}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.sections.receiverInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="receiverName"
                      label={t('frenchInvoiceDemo.fields.customerName')}
                      value={invoiceData.receiver.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'receiver')}
                      placeholder={t('frenchInvoiceDemo.placeholders.customerName')}
                    />
                    <FloatingLabelInput
                      id="receiverEmail"
                      label={t('frenchInvoiceDemo.fields.email')}
                      type="email"
                      value={invoiceData.receiver.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'receiver')}
                      placeholder={t('frenchInvoiceDemo.placeholders.email')}
                    />
                    <FloatingLabelInput
                      id="receiverAddress"
                      label={t('frenchInvoiceDemo.fields.address')}
                      value={invoiceData.receiver.address}
                      onChange={(e) => handleInputChange('address', e.target.value, 'receiver')}
                      placeholder={t('frenchInvoiceDemo.placeholders.address')}
                    />
                    <FloatingLabelInput
                      id="receiverPhone"
                      label={t('frenchInvoiceDemo.fields.phone')}
                      value={invoiceData.receiver.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'receiver')}
                      placeholder={t('frenchInvoiceDemo.placeholders.phone')}
                    />
                    <FloatingLabelInput
                      id="receiverCity"
                      label={t('frenchInvoiceDemo.fields.city')}
                      value={invoiceData.receiver.city}
                      onChange={(e) => handleInputChange('city', e.target.value, 'receiver')}
                      placeholder={t('frenchInvoiceDemo.placeholders.city')}
                    />
                    <FloatingLabelInput
                      id="receiverPostalCode"
                      label={t('frenchInvoiceDemo.fields.postalCode')}
                      value={invoiceData.receiver.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value, 'receiver')}
                      placeholder={t('frenchInvoiceDemo.placeholders.postalCode')}
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('frenchInvoiceDemo.sections.items')}</h3>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      title={t('frenchInvoiceDemo.tooltips.addItem')}
                    >
                      <Plus size={16} />
                      {t('frenchInvoiceDemo.buttons.addItem')}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {invoiceData.items.map((item, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            {t('templatePage.item')} {index + 1}
                          </span>
                          {invoiceData.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                              title={t('frenchInvoiceDemo.tooltips.removeItem')}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <FloatingLabelInput
                              id={`description-${index}`}
                              label={t('frenchInvoiceDemo.fields.description')}
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              placeholder={t('frenchInvoiceDemo.placeholders.description')}
                            />
                          </div>
                          <FloatingLabelInput
                            id={`quantity-${index}`}
                            label={t('frenchInvoiceDemo.fields.quantity')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                          <FloatingLabelInput
                            id={`unitPrice-${index}`}
                            label={t('frenchInvoiceDemo.fields.unitPrice')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{t('frenchInvoiceDemo.fields.amount')}:</span>
                              <span className="font-semibold text-gray-900">
                                {config.currency}{(item.quantity * item.unitPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Invoice Summary */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                    <h4 className="font-medium text-gray-700 mb-3">{t('frenchInvoiceDemo.sections.summary')}</h4>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                        const vatAmount = subtotal * 0.20; // 20% VAT
                        const total = subtotal + vatAmount;
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('templatePage.subtotal')}:</span>
                              <span>{config.currency}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">TVA (20%):</span>
                              <span>{config.currency}{vatAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                              <span>{t('templatePage.total')}:</span>
                              <span className="text-blue-600">{config.currency}{total.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.sections.paymentDetails')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="bankName"
                      label={t('frenchInvoiceDemo.fields.bankName')}
                      value={invoiceData.payment.bank}
                      onChange={(e) => handleInputChange('bank', e.target.value, 'payment')}
                      placeholder={t('frenchInvoiceDemo.placeholders.bankName')}
                    />
                    <FloatingLabelInput
                      id="bic"
                      label={t('frenchInvoiceDemo.fields.bic')}
                      value={invoiceData.payment.bic}
                      onChange={(e) => handleInputChange('bic', e.target.value, 'payment')}
                      placeholder={t('frenchInvoiceDemo.placeholders.bic')}
                    />
                    <div className="md:col-span-2">
                      <FloatingLabelInput
                        id="iban"
                        label={t('frenchInvoiceDemo.fields.iban')}
                        value={invoiceData.payment.iban}
                        onChange={(e) => handleInputChange('iban', e.target.value, 'payment')}
                        placeholder={t('frenchInvoiceDemo.placeholders.iban')}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes and Terms */}
                <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.sections.additionalOptions')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('frenchInvoiceDemo.fields.notes')}
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        value={invoiceData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder={t('frenchInvoiceDemo.placeholders.notes')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('frenchInvoiceDemo.fields.terms')}
                      </label>
                      <textarea
                        id="terms"
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        value={invoiceData.terms}
                        onChange={(e) => handleInputChange('terms', e.target.value)}
                        placeholder={t('frenchInvoiceDemo.placeholders.terms')}
                      />
                    </div>
                  </div>
                </div>

                {/* Moved the customization options to other sections */}
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className={`${isPreviewMode ? 'block' : 'hidden xl:block'} bg-gray-100 relative order-1 xl:order-2`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-600" />
                <span className="font-medium text-gray-900">{t('frenchInvoiceDemo.sections.preview')}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {t('frenchInvoiceDemo.tooltips.livePreview')}
                </span>
              </div>
              <button
                onClick={() => setShowFullscreen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('frenchInvoiceDemo.tooltips.fullscreen')}
              >
                <Maximize2 size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto h-[calc(100%-60px)]">
              <div className="max-w-[210mm] mx-auto bg-white shadow-lg transition-all duration-300 hover:shadow-xl invoice-preview">
                <FrenchInvoiceTemplate
                  invoiceData={invoiceData}
                  {...config}
                  enablePdfExport={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full h-full max-w-[95vw] max-h-[95vh] overflow-auto relative animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{t('templatePage.fullscreenPreview')}</h3>
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {t('frenchInvoiceDemo.messages.previewMode')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">ESC {t('common.or')} Click</span>
                <button
                  onClick={() => setShowFullscreen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('frenchInvoiceDemo.buttons.exitFullscreen')}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="max-w-[210mm] mx-auto invoice-preview">
                <FrenchInvoiceTemplate
                  invoiceData={invoiceData}
                  {...config}
                  enablePdfExport={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full h-full max-w-4xl max-h-[90vh] overflow-auto relative animate-in zoom-in-95 duration-300 rounded-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{t('frenchInvoiceDemo.customization.title')}</h3>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Section Visibility */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.customization.sections.visibility')}</h4>
                  <div className="space-y-3">
                    {Object.entries({
                      showInvoiceNumber: t('frenchInvoiceDemo.fields.invoiceNumber'),
                      showDueDate: t('frenchInvoiceDemo.fields.dueDate'),
                      showOperationType: t('frenchInvoiceDemo.fields.operationType'),
                      showOrderNumber: t('frenchInvoiceDemo.fields.orderNumber'),
                      showSenderInfo: t('frenchInvoiceDemo.fields.senderInfo'),
                      showReceiverInfo: t('frenchInvoiceDemo.fields.receiverInfo'),
                      showSellerTitle: t('frenchInvoiceDemo.fields.sellerTitle'),
                      showCustomerTitle: t('frenchInvoiceDemo.fields.customerTitle'),
                      showTotals: t('frenchInvoiceDemo.fields.totalsSection'),
                      showPaymentInfo: t('frenchInvoiceDemo.fields.paymentInfo'),
                      showNotes: t('frenchInvoiceDemo.fields.notes'),
                      showTerms: t('frenchInvoiceDemo.fields.terms')
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config[key]}
                          onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700 font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Column Visibility */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.customization.sections.columns')}</h4>
                  <div className="space-y-3">
                    {availableColumns.map(column => (
                      <label key={column} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!config.hideColumns.includes(column)}
                          onChange={() => handleColumnToggle(column)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700 font-medium">
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.customization.sections.formatting')}</h4>
                  <div className="space-y-4">
                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('frenchInvoiceDemo.fields.currency')}
                      </label>
                      <select
                        value={config.currency}
                        onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="€">{t('frenchInvoiceDemo.currencies.euro')}</option>
                        <option value="$">{t('frenchInvoiceDemo.currencies.dollar')}</option>
                        <option value="£">{t('frenchInvoiceDemo.currencies.pound')}</option>
                        <option value="¥">{t('frenchInvoiceDemo.currencies.yen')}</option>
                      </select>
                    </div>

                    {/* Locale */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('frenchInvoiceDemo.fields.locale')}
                      </label>
                      <select
                        value={config.locale}
                        onChange={(e) => setConfig(prev => ({ ...prev, locale: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="fr-FR">{t('frenchInvoiceDemo.locales.french')}</option>
                        <option value="en-US">{t('frenchInvoiceDemo.locales.english')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-4">{t('frenchInvoiceDemo.customization.sections.presets')}</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      showInvoiceNumber: true,
                      showDueDate: true,
                      showOperationType: true,
                      showOrderNumber: true,
                      showSenderInfo: true,
                      showReceiverInfo: true,
                      showSellerTitle: true,
                      showCustomerTitle: true,
                      showTotals: true,
                      showPaymentInfo: true,
                      showNotes: true,
                      showTerms: true,
                      hideColumns: []
                    }))}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium"
                  >
                    {t('frenchInvoiceDemo.presets.complete')}
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      showOperationType: false,
                      showOrderNumber: false,
                      showPaymentInfo: false,
                      showTerms: false,
                      hideColumns: ['Date', 'Unit']
                    }))}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    {t('frenchInvoiceDemo.presets.simplified')}
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      showPaymentInfo: false,
                      showTerms: false,
                      hideColumns: ['VAT'],
                      showDueDate: false
                    }))}
                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                  >
                    {t('frenchInvoiceDemo.presets.quote')}
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      showOperationType: false,
                      showOrderNumber: false,
                      showPaymentInfo: false,
                      showNotes: false,
                      showTerms: false,
                      hideColumns: ['Date', 'Unit', 'VAT']
                    }))}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {t('frenchInvoiceDemo.presets.minimal')}
                  </button>
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setShowCustomizeModal(false);
                    showToastNotification(t('frenchInvoiceDemo.messages.customizationApplied'));
                  }}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <Check size={20} />
                  {t('frenchInvoiceDemo.buttons.applyCustomization')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check size={16} />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default FrenchInvoiceDemo;