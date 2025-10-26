import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Printer, 
  Save,
  RefreshCw,
  Eye,
  Edit,
  Download,
  Palette,
  Settings,
  Maximize2,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import InvoiceTemplate from '../components/InvoiceTemplate';
import FloatingLabelInput from "../components/FloatingLabelInput";
import ShipToSection from "../components/ShipToSection";
import ItemDetails from "../components/ItemDetails";
import FrenchInvoiceCTA from "../components/FrenchInvoiceCTA";
import SmartCustomerSelector from '../components/SmartCustomerSelector';
import { generatePDF } from '../utils/pdfGenerator';
import { templates } from '../utils/templateRegistry';

import { invoiceService } from "../services/invoiceService";
import { userSettingsService } from "../services/userSettingsService";
import { customerService } from "../services/customerService";


const TemplatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Loading and UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Form states - matching the structure from Index.jsx
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [billTo, setBillTo] = useState({ name: "", address: "", phone: "" });
  const [shipTo, setShipTo] = useState({ name: "", address: "", phone: "" });
  const [invoice, setInvoice] = useState({
    date: new Date().toISOString().split('T')[0],
    paymentDate: "",
    number: "",
  });
  const [yourCompany, setYourCompany] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [items, setItems] = useState([
    { name: "", description: "", quantity: 1, amount: 0, total: 0 }
  ]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [notes, setNotes] = useState("");

  // Manual customer entry state
  const [isManualMode, setIsManualMode] = useState(false);

  // Initialize form data
  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true);
      try {
        // Load from location state if available
        if (location.state && location.state.formData) {
          const formData = location.state.formData;
          setBillTo(formData.billTo || { name: "", address: "", phone: "" });
          setShipTo(formData.shipTo || { name: "", address: "", phone: "" });
          setInvoice(formData.invoice || { date: new Date().toISOString().split('T')[0], paymentDate: "", number: "" });
          setYourCompany(formData.yourCompany || { name: "", address: "", phone: "" });
          setItems(formData.items || [{ name: "", description: "", quantity: 1, amount: 0, total: 0 }]);
          setTaxPercentage(formData.taxPercentage || 0);
          setSelectedCurrency(formData.selectedCurrency || "USD");
          setNotes(formData.notes || "");
          setCurrentTemplate(location.state.selectedTemplate || 1);
        } else {
          // Generate new invoice number
          const newInvoiceNumber = await userSettingsService.generateInvoiceNumber();
          setInvoice(prev => ({ ...prev, number: newInvoiceNumber }));
        }
      } catch (error) {
        console.error('Error initializing form:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [location.state]);

  // Calculate totals whenever items or tax changes
  const calculateSubTotal = useCallback(() => {
    const newSubTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    setSubTotal(newSubTotal);
    
    const newTaxAmount = (newSubTotal * taxPercentage) / 100;
    setTaxAmount(newTaxAmount);
    
    const newGrandTotal = newSubTotal + newTaxAmount;
    setGrandTotal(newGrandTotal);
  }, [items, taxPercentage]);

  useEffect(() => {
    calculateSubTotal();
  }, [calculateSubTotal]);

  // Keyboard support for fullscreen modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Customer handling functions
  const handleCustomerSelect = useCallback((customer) => {
    setBillTo({
      name: customer?.name || '',
      address: customer?.address || '',
      phone: customer?.phone || ''
    });
  }, []);

  const handleManualModeChange = useCallback((manualMode) => {
    setIsManualMode(manualMode);
  }, []);

  // Item management functions
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "quantity" || field === "amount") {
      newItems[index].total = newItems[index].quantity * newItems[index].amount;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: "", description: "", quantity: 1, amount: 0, total: 0 },
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleTemplateChange = (templateNumber) => {
    setCurrentTemplate(templateNumber);
  };

  const handleDownloadPDF = async () => {
    if (!isDownloading) {
      setIsDownloading(true);
      try {
        const formData = {
          billTo,
          shipTo,
          invoice,
          yourCompany,
          items,
          taxPercentage,
          taxAmount,
          subTotal,
          grandTotal,
          selectedCurrency,
          notes
        };
        await generatePDF(formData, currentTemplate);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleSaveInvoice = async () => {
    setIsSaving(true);
    try {
      const invoiceData = {
        invoice_number: invoice.number,
        invoice_date: invoice.date,
        due_date: invoice.paymentDate,
        subtotal: subTotal,
        tax_rate: taxPercentage,
        tax_amount: taxAmount,
        total_amount: grandTotal,
        currency: selectedCurrency,
        notes: notes,
        
        // Company information
        company_name: yourCompany.name,
        company_address: yourCompany.address,
        company_phone: yourCompany.phone,
        
        // Bill to information
        bill_to_name: billTo.name,
        bill_to_address: billTo.address,
        bill_to_phone: billTo.phone,
        
        // Ship to information
        ship_to_name: shipTo.name,
        ship_to_address: shipTo.address,
        ship_to_phone: shipTo.phone,
        
        // Items
        items: items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.amount) || 0,
          total: parseFloat(item.total) || 0
        }))
      };

      // Create customer if needed
      if (billTo.name && billTo.name.trim()) {
        try {
          const existingCustomers = await customerService.getCustomers();
          const customerExists = existingCustomers.some(c => 
            c.name.toLowerCase().trim() === billTo.name.toLowerCase().trim()
          );
          
          if (!customerExists) {
            await customerService.createCustomer({
              name: billTo.name,
              address: billTo.address || '',
              city: '', // Templates don't have separate city field
              phone: billTo.phone || '',
              email: '' // Templates don't have email field in billTo
            });
          }
        } catch (customerError) {
          console.error('Error handling customer:', customerError);
          // Don't fail the invoice save if customer creation fails
        }
      }
      
      await invoiceService.createInvoice(invoiceData);
      // Show success message
      alert(t('templatePage.saveSuccess', 'Invoice saved successfully!'));
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert(t('templatePage.saveError', 'Failed to save invoice. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSampleData = () => {
    setBillTo({
      name: "John Doe",
      address: "123 Main St, Anytown, USA",
      phone: "(555) 123-4567",
    });
    setShipTo({
      name: "Jane Smith",
      address: "456 Elm St, Othertown, USA",
      phone: "(555) 987-6543",
    });
    setInvoice({
      date: new Date().toISOString().split("T")[0],
      paymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      number: `INV-${Math.floor(Math.random() * 10000)}`,
    });
    setYourCompany({
      name: "Your Company",
      address: "789 Oak St, Businessville, USA",
      phone: "(555) 555-5555",
    });
    setItems([
      {
        name: "Product A",
        description: "High-quality item",
        quantity: 2,
        amount: 50,
        total: 100,
      },
      {
        name: "Service B",
        description: "Professional service",
        quantity: 1,
        amount: 200,
        total: 200,
      },
      {
        name: "Product C",
        description: "Another great product",
        quantity: 3,
        amount: 30,
        total: 90,
      },
    ]);
    setTaxPercentage(10);
    setNotes("Thank you for your business!");
    setSelectedCurrency("USD");
  };



  const handleSendEmail = () => {
    if (billTo?.name && invoice?.number) {
      const subject = `Invoice ${invoice.number}`;
      const body = `Dear ${billTo.name},\n\nPlease find attached the invoice ${invoice.number}.\n\nThank you for your business!`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/invoice');
  };

  // Loading simulation
  useEffect(() => {
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

  // Create formData object for the template
  const formData = {
    billTo,
    shipTo,
    invoice,
    yourCompany,
    items,
    taxPercentage,
    taxAmount,
    subTotal,
    grandTotal,
    selectedCurrency,
    notes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Toolbar */}
      
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('templatePage.back', 'Back')}
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {t('templatePage.title', 'Invoice Editor')}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLoadSampleData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('templatePage.loadSample', 'Load Sample')}
              </Button>
              <Button 
                onClick={handleSaveInvoice} 
                disabled={isSaving}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t('templatePage.save', 'Save')}
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {t('templatePage.download', 'Download')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          
          {/* Left Column - Invoice Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('templatePage.invoiceDetails', 'Invoice Details')}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                  onClick={handleSendEmail}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto h-full space-y-6 invoice-form-section">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
                  {t('templatePage.yourCompany', 'Your Company')}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <FloatingLabelInput
                    label={t('templatePage.companyName', 'Company Name')}
                    value={yourCompany.name}
                    onChange={(e) => setYourCompany(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company name"
                  />
                  <FloatingLabelInput
                    label={t('templatePage.companyAddress', 'Address')}
                    value={yourCompany.address}
                    onChange={(e) => setYourCompany(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter company address"
                  />
                  <FloatingLabelInput
                    label={t('templatePage.companyPhone', 'Phone')}
                    value={yourCompany.phone}
                    onChange={(e) => setYourCompany(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Invoice Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
                  {t('templatePage.invoiceInfo', 'Invoice Information')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingLabelInput
                    label={t('templatePage.invoiceNumber', 'Invoice Number')}
                    value={invoice.number}
                    onChange={(e) => setInvoice(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="INV-001"
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <FloatingLabelInput
                      label={t('templatePage.invoiceDate', 'Invoice Date')}
                      type="date"
                      value={invoice.date}
                      onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                    />
                    <FloatingLabelInput
                      label={t('templatePage.dueDate', 'Due Date')}
                      type="date"
                      value={invoice.paymentDate}
                      onChange={(e) => setInvoice(prev => ({ ...prev, paymentDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Customer Selection Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To Customer</h3>
                <SmartCustomerSelector
                  selectedCustomer={billTo}
                  onCustomerSelect={handleCustomerSelect}
                  onManualModeChange={handleManualModeChange}
                  isManualMode={isManualMode}
                  placeholder="Select or add a customer"
                />
              </div>

              {/* Bill To Section */}
              <ShipToSection 
                shipTo={shipTo} 
                setShipTo={setShipTo}
              />

              {/* Items Section */}
              <ItemDetails
                items={items}
                handleItemChange={handleItemChange}
                addItem={addItem}
                removeItem={removeItem}
                currencyCode={selectedCurrency}
              />

              {/* Tax & Currency Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
                  {t('templatePage.taxAndCurrency', 'Tax & Currency')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingLabelInput
                    label={t('templatePage.taxPercentage', 'Tax Percentage (%)')}
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('templatePage.currency', 'Currency')}
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CHF">CHF - Swiss Franc</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                  </div>
                </div>
                
                {/* Totals Display */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('templatePage.subtotal', 'Subtotal')}:</span>
                    <span className="font-medium">${subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('templatePage.tax', 'Tax')} ({taxPercentage}%):</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold border-t pt-2">
                    <span>{t('templatePage.total', 'Total')}:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
                  {t('templatePage.notes', 'Notes')}
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('templatePage.notesPlaceholder', 'Add any additional notes here...')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Invoice Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {isPreviewMode ? (
                      <>
                        <Eye className="h-5 w-5" />
                        {t('templatePage.previewMode', 'Preview Mode')}
                      </>
                    ) : (
                      <>
                        <Edit className="h-5 w-5" />
                        {t('templatePage.liveEdit', 'Live Edit')}
                      </>
                    )}
                  </h2>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    isPreviewMode 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {isPreviewMode ? 'PREVIEW' : 'EDITING'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    {isPreviewMode ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('templatePage.editMode', 'Edit Mode')}
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('templatePage.previewOnly', 'Preview Only')}
                      </>
                    )}
                  </Button>
                  {isPreviewMode && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsFullscreen(true)}
                      title={t('templatePage.fullscreen', 'Fullscreen')}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

       
            
            {/* Template Selector - Show in both modes */}
            {!isPreviewMode && (
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {t('templatePage.chooseTemplate', 'Choose Template')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template, index) => (
                    <Button
                      key={index}
                      variant={currentTemplate === index + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTemplateChange(index + 1)}
                      className="text-xs"
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Preview */}
            <div className={`overflow-auto h-full relative transition-all duration-300 ease-in-out ${isPreviewMode ? 'p-0 bg-white' : 'p-4 bg-gray-100'}`}>
              {isPreviewMode ? (
                /* Full Preview Mode - Clean Invoice Display with Horizontal Scroll */
                <div className="min-w-[210mm] h-full overflow-x-auto">
                  <div className="w-[210mm] min-h-[297mm] mx-auto">
                    <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
                  </div>
                </div>
              ) : (
                /* Live Edit Mode - Invoice with Frame and Horizontal Scroll */
                <div className="min-w-[210mm] overflow-x-auto">
                  <div className="w-[210mm] mx-auto bg-white shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '842px' }}>
                    <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFullscreen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-[95vw] h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('templatePage.fullscreenPreview', 'Fullscreen Preview')}
                </h3>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {templates.find((_, index) => index + 1 === currentTemplate)?.name || `Template ${currentTemplate}`}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Template Selector in Fullscreen */}
                <div className="flex items-center gap-2 mr-4">
                  <Palette className="h-4 w-4 text-gray-600" />
                  <select
                    value={currentTemplate}
                    onChange={(e) => handleTemplateChange(parseInt(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {templates.map((template, index) => (
                      <option key={index} value={index + 1}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  {t('templatePage.print', 'Print')}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('templatePage.close', 'Close')}
                </Button>
              </div>
            </div>
            
            {/* Fullscreen Invoice Preview */}
            <div className="h-full overflow-auto bg-gray-100 p-8">
              <div className="max-w-[210mm] mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
              </div>
            </div>
          </div>
        </div>
      )}
           {/* Customizable Invoice CTA */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <FrenchInvoiceCTA />
            </div>
    </div>
  );
};

export default TemplatePage;
