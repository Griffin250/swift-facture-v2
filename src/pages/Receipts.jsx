import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { receiptService } from '@/services/receiptService';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Copy, 
  ChevronDown,
  Plus,
  TrendingUp,
  DollarSign,
  Receipt as ReceiptIcon,
  Calendar,
  MoreVertical,
  ArrowUpRight,
  Save,
  Send,
  Loader2,
  RefreshCw,
  RotateCw,
  X,
  Download,
  Printer,
  FileImage,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatCurrency";
import { useToast } from "@/components/ui/use-toast";
import FloatingLabelInput from "../components/FloatingLabelInput";
import ItemDetails from "../components/ItemDetails";
import Receipt1 from "../components/templates/Receipt1";
import Receipt2 from "../components/templates/Receipt2";
import Receipt3 from "../components/templates/Receipt3";
import Receipt4 from "../components/templates/Receipt4";
import { generateReceiptPDF } from "../utils/receiptPDFGenerator";
import { generateGSTNumber } from "../utils/invoiceCalculations";

const currencyMap = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
};

const generateRandomReceiptNumber = () => {
  const length = Math.floor(Math.random() * 6) + 3;
  const alphabetCount = Math.min(Math.floor(Math.random() * 4), length);
  let result = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  for (let i = 0; i < alphabetCount; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  for (let i = alphabetCount; i < length; i++) {
    result += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return result;
};

const footerOptions = [
  "Thank you for choosing us today! We hope your shopping experience was pleasant and seamless.",
  "Your purchase supports our community! We believe in giving back and working towards a better future.",
  "We value your feedback! Help us improve by sharing your thoughts with us.",
  "Keep this receipt for returns or exchanges.",
  "Have a great day!",
  "Thank you for your business!"
];

const Receipts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Receipt creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEmailNotice, setShowEmailNotice] = useState(false);
  
  // Form data
  const [billTo, setBillTo] = useState("");
  const [invoice, setInvoice] = useState({
    date: new Date().toISOString().split('T')[0],
    number: generateRandomReceiptNumber(),
  });
  const [yourCompany, setYourCompany] = useState({
    name: "",
    address: "",
    phone: "",
    gst: "",
  });
  const [cashier, setCashier] = useState("");
  const [items, setItems] = useState([
    { name: "", description: "", quantity: 1, amount: 0, total: 0 },
  ]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [theme, setTheme] = useState("Receipt1");
  const [notes, setNotes] = useState("");
  const [footer, setFooter] = useState("Thank you for your business!");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Fetch receipts and stats
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [receiptsResult, statsResult] = await Promise.all([
        receiptService.getAllReceipts(),
        receiptService.getReceiptStats()
      ]);

      if (receiptsResult.error) throw receiptsResult.error;
      if (statsResult.error) throw statsResult.error;

      setReceipts(receiptsResult.data || []);
      setStats(statsResult.data);
    } catch (err) {
      console.error('Error fetching receipt data:', err);
      setError(err.message || 'Failed to load receipts');
      toast({
        title: "Error",
        description: "Failed to load receipts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort receipts
  const filteredAndSortedReceipts = useCallback(() => {
    let filtered = receipts.filter(receipt => {
      const matchesSearch = !searchTerm || 
        receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPaymentMethod = paymentMethodFilter === 'All' || 
        receipt.payment_method === paymentMethodFilter;

      return matchesSearch && matchesPaymentMethod;
    });

    // Sort receipts
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = parseFloat(a.total || 0) - parseFloat(b.total || 0);
          break;
        case 'receipt_number':
          comparison = (a.receipt_number || '').localeCompare(b.receipt_number || '');
          break;
        case 'customer':
          comparison = (a.customers?.name || '').localeCompare(b.customers?.name || '');
          break;
        default:
          comparison = new Date(a.created_at) - new Date(b.created_at);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [receipts, searchTerm, paymentMethodFilter, sortBy, sortOrder]);

  // Handle actions
  const handleCreateNew = () => {
    setShowCreateForm(true);
    // Reset form data
    setBillTo("");
    setInvoice({ 
      date: new Date().toISOString().split('T')[0], 
      number: generateRandomReceiptNumber() 
    });
    setYourCompany({ name: "", address: "", phone: "", gst: "" });
    setCashier("");
    setItems([{ name: "", description: "", quantity: 1, amount: 0, total: 0 }]);
    setTaxPercentage(0);
    setNotes("");
    setFooter("Thank you for your business!");
    setTheme("Receipt1");
  };

  const handleView = (receipt) => {
    // Open receipt in view mode - could navigate to a view page
    console.log('View receipt:', receipt);
  };

  const handleEdit = (receipt) => {
    // Navigate to edit receipt
    navigate(`/receipt?edit=${receipt.id}`);
  };

  const handleDuplicate = async (receipt) => {
    try {
      await receiptService.duplicateReceipt(receipt.id);
      toast({
        title: "Success",
        description: "Receipt duplicated successfully",
      });
      fetchData(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate receipt",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedReceipt) return;
    
    try {
      await receiptService.deleteReceipt(selectedReceipt.id);
      toast({
        title: "Success",
        description: "Receipt deleted successfully",
      });
      setShowDeleteDialog(false);
      setSelectedReceipt(null);
      fetchData(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete receipt",
        variant: "destructive",
      });
    }
  };

  const handleEmail = (receipt) => {
    // Email receipt functionality
    console.log('Email receipt:', receipt);
    toast({
      title: "Coming Soon",
      description: "Email functionality will be available soon",
    });
  };

  // Get payment method badge color
  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return 'bg-green-100 text-green-800 border-green-200';
      case 'card': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'check': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Receipt creation helper functions
  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "quantity" || field === "amount") {
      newItems[index].total = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].amount) || 0);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", description: "", quantity: 1, amount: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateSubTotal = () => {
    const raw = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const amt = parseFloat(item.amount) || 0;
      return sum + qty * amt;
    }, 0);
    return Math.round(raw * 100) / 100;
  };

  const calculateTaxAmount = () => {
    const subTotal = calculateSubTotal();
    const tax = (subTotal * (parseFloat(taxPercentage) || 0)) / 100;
    return Math.round(tax * 100) / 100;
  };

  const calculateGrandTotal = () => {
    const subTotal = calculateSubTotal();
    const taxAmount = calculateTaxAmount();
    return Math.round((subTotal + taxAmount) * 100) / 100;
  };

  const renderCurrency = (value) => {
    const sign = (currencyMap && (currencyMap[selectedCurrency])) || '';
    const num = Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${sign}${num}`;
  };

  // Save receipt function
  const handleSaveReceipt = async (status = 'draft') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save receipts.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const receiptData = {
        receipt_number: invoice.number,
        date: invoice.date || new Date().toISOString().split('T')[0],
        template_name: theme.toLowerCase(),
        subtotal: calculateSubTotal(),
        tax: calculateTaxAmount(),
        total: calculateGrandTotal(),
        payment_method: 'cash',
        notes: notes,
        status: status,
        items: items.filter(item => item.name && item.quantity && item.amount).map(item => ({
          description: item.name,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.amount) || 0,
        })),
      };

      const result = await receiptService.createReceipt(receiptData);

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Receipt Saved",
        description: `Receipt ${status === 'draft' ? 'saved as draft' : 'marked as sent'} successfully.`,
      });

      // Refresh dashboard data and close form
      await fetchData();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const refreshFooter = () => {
    const randomIndex = Math.floor(Math.random() * footerOptions.length);
    setFooter(footerOptions[randomIndex]);
  };

  // Additional action functions
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const receiptData = {
        billTo,
        invoice,
        yourCompany,
        cashier,
        items,
        taxPercentage,
        notes,
        footer,
        selectedCurrency,
        currencySign: (currencyMap && currencyMap[selectedCurrency]) || '',
        grandTotal: calculateGrandTotal(),
      };
      
      // Find receipt ref element
      const receiptRef = document.querySelector('.receipt-preview');
      if (receiptRef) {
        await generateReceiptPDF(receiptRef, theme, receiptData);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const receiptRef = document.querySelector('.receipt-preview');
    if (receiptRef) {
      const printContents = receiptRef.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=400');
      printWindow.document.write('<html><head><title>Print Receipt</title>');
      printWindow.document.write('<style>body{font-family:Inter,sans-serif;padding:1rem;}@media print{body{zoom:0.8;}}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
    }
  };

  const handleSendEmail = () => {
    setShowEmailModal(false);
    setShowEmailNotice(true);
    setTimeout(() => setShowEmailNotice(false), 2500);
  };

  const handleDownloadPNG = async () => {
    // This would convert the receipt to PNG
    toast({
      title: "Coming Soon",
      description: "PNG download functionality will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <ReceiptIcon className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Receipts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const filteredReceipts = filteredAndSortedReceipts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold gradient-text">{t('receiptPage.title', 'SwiftFacture Receipts')}</h1>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCreateNew}
                className="font-semibold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('receiptPage.createReceipt', 'Create Receipt')}
              </Button>
              <Button
                variant="outline"
                className="font-semibold border-2 bg-white text-primary border-primary hover:bg-primary hover:text-white transition-all"
              >
                <ReceiptIcon className="mr-2 h-4 w-4" />
                {t('receiptPage.viewAllReceipts', 'View All Receipts')}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-lg text-muted-foreground mb-2">
                {t('receipts.subtitle', 'Manage and track all your payment receipts')}
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Creation Form */}
        {showCreateForm && (
          <div className="mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">Create New Receipt</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    onClick={() => handleSaveReceipt('draft')}
                    disabled={isSaving}
                    className="font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('receiptPage.saving', 'Saving...')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('receiptPage.saveDraft', 'Save as Draft')}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSaveReceipt('sent')}
                    disabled={isSaving}
                    className="font-semibold bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('receiptPage.saving', 'Saving...')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send and Save Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    variant="outline"
                    className="font-semibold"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? 'Generating...' : 'Download PDF'}
                  </Button>
                  <Button
                    onClick={handleDownloadPNG}
                    variant="outline"
                    className="font-semibold"
                  >
                    <FileImage className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => setShowEmailModal(true)}
                    variant="outline"
                    className="font-semibold"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send via Email
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="font-semibold"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>

                {/* Receipt Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form Section */}
                  <div className="space-y-6">
                    {/* Company Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('receiptPage.yourCompany')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput
                          id="yourCompanyName"
                          label={t('receiptPage.name')}
                          value={yourCompany.name}
                          onChange={handleInputChange(setYourCompany)}
                          name="name"
                        />
                        <FloatingLabelInput
                          id="yourCompanyPhone"
                          label={t('receiptPage.phone')}
                          value={yourCompany.phone}
                          onChange={handleInputChange(setYourCompany)}
                          name="phone"
                        />
                      </div>
                      <FloatingLabelInput
                        id="yourCompanyAddress"
                        label={t('receiptPage.address')}
                        value={yourCompany.address}
                        onChange={handleInputChange(setYourCompany)}
                        name="address"
                        className="mt-4"
                      />
                      <div className="relative mt-4">
                        <FloatingLabelInput
                          id="yourCompanyGST"
                          label={t('receiptPage.gstNo')}
                          value={yourCompany.gst}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 15);
                            handleInputChange(setYourCompany)({
                              target: { name: "gst", value },
                            });
                          }}
                          name="gst"
                          maxLength={15}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newGST = generateGSTNumber();
                            setYourCompany(prev => ({ ...prev, gst: newGST }));
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
                          title={t('receiptPage.generateNewGST')}
                        >
                          <RotateCw size={16} />
                        </button>
                      </div>
                      <FloatingLabelInput
                        id="cashier"
                        label={t('receiptPage.cashier')}
                        value={cashier}
                        onChange={(e) => setCashier(e.target.value)}
                        name="cashier"
                        className="mt-4"
                      />
                    </div>

                    {/* Bill To */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('receiptPage.billTo')}</h3>
                      <FloatingLabelInput
                        id="billTo"
                        label={t('receiptPage.billTo')}
                        value={billTo}
                        onChange={(e) => setBillTo(e.target.value)}
                        name="billTo"
                      />
                    </div>

                    {/* Invoice Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('receiptPage.invoiceInformation')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput
                          id="invoiceNumber"
                          label={t('receiptPage.invoiceNumber')}
                          value={invoice.number}
                          onChange={handleInputChange(setInvoice)}
                          name="number"
                        />
                        <FloatingLabelInput
                          id="invoiceDate"
                          label={t('receiptPage.invoiceDate')}
                          type="date"
                          value={invoice.date}
                          onChange={handleInputChange(setInvoice)}
                          name="date"
                        />
                      </div>
                    </div>

                    {/* Items */}
                    <ItemDetails
                      items={items}
                      handleItemChange={handleItemChange}
                      addItem={addItem}
                      removeItem={removeItem}
                    />

                    {/* Totals */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">{t('receiptPage.totals')}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t('receiptPage.subTotal')}:</span>
                          <span>{renderCurrency(calculateSubTotal())}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{t('receiptPage.tax')}:</span>
                          <input
                            type="number"
                            value={taxPercentage}
                            onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                            className="w-20 p-2 border rounded text-right"
                            min="0"
                            max="28"
                            step="1"
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>{t('receiptPage.taxAmount')}:</span>
                          <span>{renderCurrency(calculateTaxAmount())}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>{t('receiptPage.grandTotal')}:</span>
                          <span>{renderCurrency(calculateGrandTotal())}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes and Footer */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">{t('receiptPage.notes')}</h3>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          rows="3"
                          placeholder={t('receiptPage.notesPlaceholder')}
                        />
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium">{t('receiptPage.footer')}</h3>
                          <button
                            type="button"
                            onClick={refreshFooter}
                            className="ml-2 p-1 rounded-full hover:bg-gray-200"
                            title={t('receiptPage.refreshFooter')}
                          >
                            <RefreshCw size={16} />
                          </button>
                        </div>
                        <textarea
                          value={footer}
                          onChange={(e) => setFooter(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t('receiptPage.receiptTheme')}</h3>
                    
                    {/* Theme Selection */}
                    <div className="flex flex-wrap gap-2">
                      {['Receipt1', 'Receipt2', 'Receipt3', 'Receipt4'].map((themeOption) => (
                        <label key={themeOption} className="cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            value={themeOption}
                            checked={theme === themeOption}
                            onChange={() => setTheme(themeOption)}
                            className="sr-only"
                          />
                          <div className={`px-3 py-2 rounded-lg border-2 transition-all ${
                            theme === themeOption 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}>
                            {themeOption.replace('Receipt', 'Theme ')}
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Preview */}
                    <div className="receipt-preview w-full max-w-[380px] mx-auto border shadow-lg rounded-lg overflow-hidden">
                      {theme === "Receipt1" && (
                        <Receipt1
                          data={{
                            billTo,
                            invoice,
                            yourCompany,
                            cashier,
                            items,
                            taxPercentage,
                            notes,
                            footer,
                            selectedCurrency,
                          }}
                        />
                      )}
                      {theme === "Receipt2" && (
                        <Receipt2
                          data={{
                            billTo,
                            invoice,
                            yourCompany,
                            cashier,
                            items,
                            taxPercentage,
                            notes,
                            footer,
                            selectedCurrency,
                          }}
                        />
                      )}
                      {theme === "Receipt3" && (
                        <Receipt3
                          data={{
                            billTo,
                            invoice,
                            yourCompany,
                            cashier,
                            items,
                            taxPercentage,
                            notes,
                            footer,
                            selectedCurrency,
                          }}
                        />
                      )}
                      {theme === "Receipt4" && (
                        <Receipt4
                          data={{
                            billTo,
                            invoice,
                            yourCompany,
                            items,
                            taxPercentage,
                            footer,
                            cashier,
                            selectedCurrency,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReceipts}</p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">+{stats.monthReceipts} this month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ReceiptIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalRevenue, 'USD')}
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        +{formatCurrency(stats.monthRevenue, 'USD')} this month
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today&apos;s Receipts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayReceipts}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {formatCurrency(stats.todayRevenue, 'USD')} revenue
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Receipt</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalReceipts > 0 
                        ? formatCurrency(stats.totalRevenue / stats.totalReceipts, 'USD')
                        : formatCurrency(0, 'USD')
                      }
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-xs text-blue-600">Performance metric</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('receipts.search.placeholder', 'Search receipts by number, customer, or notes...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Payment Method Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Payment Method: {paymentMethodFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPaymentMethodFilter('All')}>
                    All Methods
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentMethodFilter('Cash')}>
                    Cash
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentMethodFilter('Card')}>
                    Card
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentMethodFilter('Check')}>
                    Check
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Sort: {sortBy} ({sortOrder})
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    By Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('amount')}>
                    By Amount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('receipt_number')}>
                    By Receipt Number
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('customer')}>
                    By Customer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Receipts List */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptIcon className="h-5 w-5" />
              Receipts ({filteredReceipts.length})
            </CardTitle>
            <CardDescription>
              {filteredReceipts.length === 0 
                ? 'No receipts found matching your criteria'
                : `Showing ${filteredReceipts.length} receipt${filteredReceipts.length !== 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredReceipts.length === 0 ? (
              <div className="text-center py-12">
                <ReceiptIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || paymentMethodFilter !== 'All' 
                    ? 'No matching receipts found' 
                    : 'No receipts yet'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || paymentMethodFilter !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first receipt to get started'
                  }
                </p>
                <Button onClick={handleCreateNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Receipt
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <div 
                    key={receipt.id} 
                    className="p-6 hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {receipt.receipt_number}
                          </h3>
                          <Badge 
                            variant={receipt.status === 'sent' ? 'default' : 'secondary'}
                            className={receipt.status === 'sent' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}
                          >
                            {receipt.status || 'draft'}
                          </Badge>
                          {receipt.payment_method && (
                            <Badge className={getPaymentMethodColor(receipt.payment_method)}>
                              {receipt.payment_method}
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {formatCurrency(receipt.total || 0, 'USD')}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span>
                              <strong>Customer:</strong> {receipt.customers?.name || 'Walk-in Customer'}
                            </span>
                            <span>
                              <strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {receipt.notes && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {receipt.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(receipt)}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(receipt)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(receipt)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmail(receipt)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedReceipt(receipt);
                              setShowDeleteDialog(true);
                            }}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Receipt</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete receipt &quot;{selectedReceipt?.receipt_number}&quot;? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Email Modal */}
        <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Receipt via Email</DialogTitle>
              <DialogDescription>
                Enter the email address to send this receipt.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Email Notification */}
        {showEmailNotice && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Email sent successfully!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipts;