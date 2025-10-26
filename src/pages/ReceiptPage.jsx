import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw, FileText, RotateCw, List, Plus, Save, Send, Eye, Receipt as ReceiptIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { receiptService } from "@/services/receiptService";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Receipt1 from "../components/templates/Receipt1";
import Receipt2 from "../components/templates/Receipt2";
import Receipt3 from "../components/templates/Receipt3";
import Receipt4 from "../components/templates/Receipt4";
import { generateReceiptPDF } from "../utils/receiptPDFGenerator";
import { generateGSTNumber } from "../utils/invoiceCalculations";
import FloatingLabelInput from "../components/FloatingLabelInput";
import ItemDetails from "../components/ItemDetails";


const currencyMap = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
};


const generateRandomInvoiceNumber = () => {
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
  "Thank you for choosing us today! We hope your shopping experience was pleasant and seamless. Your satisfaction matters to us, and we look forward to serving you again soon. Keep this receipt for any returns or exchanges.",
  "Your purchase supports our community! We believe in giving back and working towards a better future. Thank you for being a part of our journey. We appreciate your trust and hope to see you again soon.",
  "We value your feedback! Help us improve by sharing your thoughts on the text message survey link. Your opinions help us serve you better and improve your shopping experience. Thank you for shopping with us!",
  "Did you know you can save more with our loyalty program? Ask about it on your next visit and earn points on every purchase. It’s our way of saying thank you for being a loyal customer. See you next time!",
  "Need assistance with your purchase? We’re here to help! Reach out to our customer support, or visit our website for more information. We’re committed to providing you with the best service possible.",
  "Keep this receipt for returns or exchanges.",
  "Every purchase makes a difference! We are dedicated to eco-friendly practices and sustainability. Thank you for supporting a greener planet with us. Together, we can build a better tomorrow.",
  "Have a great day!",
  "“Thank you for shopping with us today. Did you know you can return or exchange your items within 30 days with this receipt? We want to ensure that you’re happy with your purchase, so don’t hesitate to come back if you need assistance.",
  "Eco-friendly business. This receipt is recyclable.",
  "We hope you enjoyed your shopping experience! Remember, for every friend you refer, you can earn exclusive rewards. Visit www.example.com/refer for more details. We look forward to welcoming you back soon!",
  "Thank you for choosing us! We appreciate your business and look forward to serving you again. Keep this receipt for any future inquiries or returns.",
  "Your purchase supports local businesses and helps us continue our mission. Thank you for being a valued customer. We hope to see you again soon!",
  "We hope you had a great shopping experience today. If you have any feedback, please share it with us on our website. We are always here to assist you.",
  "Thank you for your visit! Remember, we offer exclusive discounts to returning customers. Check your email for special offers on your next purchase.",
  "Your satisfaction is our top priority. If you need any help or have questions about your purchase, don’t hesitate to contact us. Have a great day!",
  "We love our customers! Thank you for supporting our business. Follow us on social media for updates on promotions and new products. See you next time!",
  "Every purchase counts! We are committed to making a positive impact, and your support helps us achieve our goals. Thank you for shopping with us today!",
  "We hope you found everything you needed. If not, please let us know so we can improve your experience. Your feedback helps us serve you better. Thank you!",
  "Thank you for visiting! Did you know you can save more with our rewards program? Ask about it during your next visit and start earning points today!",
  "We appreciate your trust in us. If you ever need assistance with your order, please visit our website or call customer service. We’re here to help!",
];

const ReceiptPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef(null);

  // Handle navigation with scroll to top
  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [billTo, setBillTo] = useState("");
  const [invoice, setInvoice] = useState({
    date: "",
    number: generateRandomInvoiceNumber(),
  });
  const [yourCompany, setYourCompany] = useState({
    name: "",
    address: "",
    phone: "",
    gst: "",
  });
  const [cashier, setCashier] = useState("");
  const [items, setItems] = useState([
    { name: "", description: "", quantity: 0, amount: 0, total: 0 },
  ]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [theme, setTheme] = useState("Receipt1");
  const [notes, setNotes] = useState("");
  const [footer, setFooter] = useState("Thank you");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  // Email/print modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEmailNotice, setShowEmailNotice] = useState(false);
  
  // Receipt management state
  const [receipts, setReceipts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReceiptId, setSavedReceiptId] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshFooter = () => {
    const randomIndex = Math.floor(Math.random() * footerOptions.length);
    setFooter(footerOptions[randomIndex]);
  };

  useEffect(() => {
    // Load form data from localStorage on component mount
    const savedFormData = localStorage.getItem("receiptFormData");
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setBillTo(parsedData.billTo || "");
      setInvoice(parsedData.invoice || { date: "", number: generateRandomInvoiceNumber() });
      setYourCompany(parsedData.yourCompany || { name: "", address: "", phone: "", gst: "" });
      setCashier(parsedData.cashier || "");
      setItems(parsedData.items || [{ name: "", description: "", quantity: 0, amount: 0, total: 0 }]);
      setTaxPercentage(parsedData.taxPercentage || 0);
      setNotes(parsedData.notes || "");
      setFooter(parsedData.footer || "Thank you");
  setSelectedCurrency(parsedData.selectedCurrency || "USD");
    } else {
      // Initialize with default values if nothing in localStorage
      setInvoice((prev) => ({ ...prev, number: generateRandomInvoiceNumber() }));
      setItems([{ name: "", description: "", quantity: 0, amount: 0, total: 0 }]);
    }
  }, []);

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    const formData = {
      billTo,
      invoice,
      yourCompany,
      cashier,
      items,
      taxPercentage,
      notes,
      footer,
      selectedCurrency,
    };
    localStorage.setItem("receiptFormData", JSON.stringify(formData));
  }, [billTo, invoice, yourCompany, cashier, items, taxPercentage, notes, footer, selectedCurrency]);

  const handleDownloadPDF = async () => {
    if (!isDownloading && receiptRef.current) {
      setIsDownloading(true);
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
      try {
        await generateReceiptPDF(receiptRef.current, theme, receiptData);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Print only the receipt preview
  const handlePrint = () => {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=400');
      printWindow.document.write('<html><head><title>Print Receipt</title>');
      printWindow.document.write('<style>body{font-family:Inter,sans-serif;padding:1rem;}@media print{body{zoom:0.8;}}</style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
    }
  };

  // Show modal and then notification for email (coming soon)
  const handleSendEmail = () => {
    setShowEmailModal(false);
    setShowEmailNotice(true);
    setTimeout(() => setShowEmailNotice(false), 2500);
  };

  // Save receipt as draft or sent
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
        payment_method: 'cash', // Default, can be enhanced later
        notes: notes,
        status: status,
        items: items.filter(item => item.name && item.quantity && item.amount).map(item => ({
          description: item.name,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.amount) || 0,
        })),
      };

      let result;
      if (savedReceiptId) {
        result = await receiptService.updateReceipt(savedReceiptId, receiptData);
      } else {
        result = await receiptService.createReceipt(receiptData);
      }

      if (result.error) {
        throw result.error;
      }

      setSavedReceiptId(result.data.id);
      
      toast({
        title: "Receipt Saved",
        description: `Receipt ${status === 'draft' ? 'saved as draft' : 'marked as sent'} successfully.`,
      });

      // Refresh dashboard data
      await loadReceipts();
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

  // Load receipts for dashboard
  const loadReceipts = async () => {
    try {
      const result = await receiptService.getAllReceipts();
      if (result.data) {
        setReceipts(result.data);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  // Load receipts on component mount
  useEffect(() => {
    if (user) {
      loadReceipts();
    }
  }, [user]);

  // handleBack removed (not used)

  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

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
      { name: "", description: "", quantity: 0, amount: 0, total: 0 },
    ]);
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
    return Math.round(raw * 100) / 100; // numeric
  };

  const calculateTaxAmount = () => {
    const subTotal = calculateSubTotal();
    const tax = (subTotal * (parseFloat(taxPercentage) || 0)) / 100;
    return Math.round(tax * 100) / 100; // numeric
  };

  const calculateGrandTotal = () => {
    const subTotal = calculateSubTotal();
    const taxAmount = calculateTaxAmount();
    return Math.round((subTotal + taxAmount) * 100) / 100; // numeric
  };

  // currency display helper
  const renderCurrency = (value) => {
    const sign = (currencyMap && (currencyMap[selectedCurrency])) || '';
    const num = Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${sign}${num}`;
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

  return (
  
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">

      <div className="container mx-auto px-4 py-8 relative">
        {/* Navigation Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold gradient-text">{t('receiptPage.title')}</h1>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="font-semibold border-2 bg-white text-primary border-primary hover:bg-primary hover:text-white transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('receiptPage.createReceipt', 'Create Receipt')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/receipts')}
                className="font-semibold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <List className="mr-2 h-4 w-4" />
                {t('receiptPage.viewAllReceipts', 'View All Receipts')}
              </Button>
            </div>
          </div>
        </div>

        {/* Compact Dashboard */}
        {showDashboard && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Receipts</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDashboard(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Hide Dashboard
              </Button>
            </div>
            
            {/* Stats Cards - Compact View */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-xl font-bold text-gray-900">{receipts.length}</p>
                    </div>
                    <ReceiptIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-xl font-bold text-gray-900">
                        {receipts.filter(r => r.status === 'draft').length}
                      </p>
                    </div>
                    <Eye className="h-6 w-6 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sent</p>
                      <p className="text-xl font-bold text-gray-900">
                        {receipts.filter(r => r.status === 'sent').length}
                      </p>
                    </div>
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-xl font-bold text-gray-900">
                        {receipts.filter(r => {
                          const today = new Date().toDateString();
                          return new Date(r.created_at).toDateString() === today;
                        }).length}
                      </p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Receipts List - Compact */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                {receipts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No receipts yet. Create your first receipt below!</p>
                ) : (
                  <div className="space-y-2">
                    {receipts.slice(0, 3).map((receipt) => (
                      <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ReceiptIcon className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-sm">{receipt.receipt_number}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(receipt.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={receipt.status === 'sent' ? 'default' : 'secondary'}>
                            {receipt.status}
                          </Badge>
                          <span className="text-sm font-medium">
                            ${receipt.total?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {receipts.length > 3 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/receipts')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View all {receipts.length} receipts →
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!showDashboard && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDashboard(true)}
              className="text-gray-600 hover:text-gray-800"
            >
              Show Dashboard
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div className="text-lg text-muted-foreground">{t('receiptPage.fillForm', 'Fill in the details below to create your receipt')}</div>
          <div className="flex flex-wrap items-center gap-4">
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
                  {t('receiptPage.markAsSent', 'Mark as Sent')}
                </>
              )}
            </Button>
            <Button
              variant="accent"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="font-semibold"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('receiptPage.generatingPDF')}
                </>
              ) : (
                t('receiptPage.downloadReceiptPDF')
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(true)}
              className="font-semibold"
            >
              {t('receiptPage.sendViaEmail')}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="font-semibold"
            >
              {t('receiptPage.printReceipt')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleNavigation("/")}
              size="icon"
              className="rounded-full"
              title={t('receiptPage.switchToInvoice')}
            >
              <FileText size={20} />
            </Button>
          </div>

          {/* Email Modal */}
          {showEmailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm animate-fade-in">
                <h3 className="text-lg font-bold mb-2">Send Receipt via Email</h3>
                <div className="mb-4 text-gray-600">Email receipts is coming soon.</div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendEmail}
                  >
                    OK
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Email notification */}
          {showEmailNotice && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in transition-all">
              Email receipts is coming soon.
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 card-modern">
            <form className="space-y-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold gradient-text mb-6">{t('receiptPage.yourCompany')}</h2>
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

              <div className="mb-8">
                <h2 className="text-2xl font-semibold gradient-text mb-6">{t('receiptPage.billTo')}</h2>
                <FloatingLabelInput
                  id="billTo"
                  label={t('receiptPage.billTo')}
                  value={billTo}
                  onChange={(e) => setBillTo(e.target.value)}
                  name="billTo"
                />
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold gradient-text mb-6">
                  {t('receiptPage.invoiceInformation')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <ItemDetails
              items={items}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
            />

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{t('receiptPage.totals')}</h3>
              <div className="flex justify-between mb-2">
                <span>{t('receiptPage.subTotal')}:</span>
                <span>{renderCurrency(calculateSubTotal())}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>{t('receiptPage.tax')}:</span>
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) =>
                    setTaxPercentage(parseFloat(e.target.value) || 0)
                  }
                  className="w-24 p-2 border rounded"
                  min="0"
                  max="28"
                  step="1"
                />
              </div>
              <div className="flex justify-between mb-2">
                <span>{t('receiptPage.taxAmount')}:</span>
                <span>{renderCurrency(calculateTaxAmount())}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{t('receiptPage.grandTotal')}:</span>
                <span>{renderCurrency(calculateGrandTotal())}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{t('receiptPage.notes')}</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded"
                rows="4"
              ></textarea>
            </div>
            <div className="mb-6">
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
                className="w-full p-2 border rounded"
                rows="2"
              ></textarea>
            </div>
          </form>
          </div>

 <div className="w-full lg:w-1/2 card-modern">
  <h2 className="text-2xl font-bold gradient-text mb-6">{t('receiptPage.receiptTheme')}</h2>
  
  <div className="lg:hidden mb-4">
    <div className="relative">
      <select 
        className="w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="Receipt1">Receipt 1</option>
        <option value="Receipt2">Receipt 2</option>
        <option value="Receipt3">Receipt 3</option>
        <option value="Receipt4">Receipt 4</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
  

  <div className="hidden lg:block mb-6">
    <h3 className="text-lg font-medium mb-3">{t('receiptPage.receiptTheme')}</h3>
    <div className="flex flex-wrap gap-3">
      <label className="custom-radio">
        <input
          type="radio"
          name="theme"
          value="Receipt1"
          checked={theme === "Receipt1"}
          onChange={() => setTheme("Receipt1")}
        />
        <span className="radio-label">Receipt 1</span>
      </label>
      <label className="custom-radio">
        <input
          type="radio"
          name="theme"
          value="Receipt2"
          checked={theme === "Receipt2"}
          onChange={() => setTheme("Receipt2")}
        />
        <span className="radio-label">Receipt 2</span>
      </label>
      <label className="custom-radio">
        <input
          type="radio"
          name="theme"
          value="Receipt3"
          checked={theme === "Receipt3"}
          onChange={() => setTheme("Receipt3")}
        />
        <span className="radio-label">Receipt 3</span>
      </label>
      <label className="custom-radio">
        <input
          type="radio"
          name="theme"
          value="Receipt4"
          checked={theme === "Receipt4"}
          onChange={() => setTheme("Receipt4")}
        />
        <span className="radio-label">Receipt 4</span>
      </label>
    </div>
  </div>
  

  <div ref={receiptRef} className="w-full max-w-[380px] mx-auto border shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
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
      </div>
    </div>
  );
};

export default ReceiptPage;
