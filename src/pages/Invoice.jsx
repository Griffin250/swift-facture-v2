import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils/formatCurrency"; // Corrected import path
import FloatingLabelInput from "../components/FloatingLabelInput";
import BillToSection from "../components/BillToSection";
import ShipToSection from "../components/ShipToSection";
import ItemDetails from "../components/ItemDetails";
import { templates } from "../utils/templateRegistry";
import { FiEdit, FiTrash2 } from "react-icons/fi"; // Added FiTrash2 icon
import { RefreshCw, Save, Mail } from "lucide-react";
import InvoiceDashboard from "../components/InvoiceDashboard";
import { invoiceService } from "../services/invoiceService";
import { userSettingsService } from "../services/userSettingsService";
import SmartCustomerSelector from "../components/SmartCustomerSelector";
import { customerService } from "../services/customerService";
import FrenchInvoiceCTA from "@/components/FrenchInvoiceCTA";

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

const noteOptions = [
  "Thank you for choosing us today! We hope your shopping experience was pleasant and seamless. Your satisfaction matters to us, and we look forward to serving you again soon. Keep this receipt for any returns or exchanges.",
  "Your purchase supports our community! We believe in giving back and working towards a better future. Thank you for being a part of our journey. We appreciate your trust and hope to see you again soon.",
  "We value your feedback! Help us improve by sharing your thoughts on the text message survey link. Your opinions help us serve you better and improve your shopping experience. Thank you for shopping with us!",
  "Did you know you can save more with our loyalty program? Ask about it on your next visit and earn points on every purchase. It's our way of saying thank you for being a loyal customer. See you next time!",
  "Need assistance with your purchase? We're here to help! Reach out to our customer support, or visit our website for more information. We're committed to providing you with the best service possible.",
  "Keep this receipt for returns or exchanges.",
  "Every purchase makes a difference! We are dedicated to eco-friendly practices and sustainability. Thank you for supporting a greener planet with us. Together, we can build a better tomorrow.",
  "Have a great day!",
  "Thank you for shopping with us today. Did you know you can return or exchange your items within 30 days with this receipt? We want to ensure that you're happy with your purchase, so don't hesitate to come back if you need assistance.",
  "Eco-friendly business. This receipt is recyclable.",
  "We hope you enjoyed your shopping experience! Remember, for every friend you refer, you can earn exclusive rewards. Visit www.example.com/refer for more details. We look forward to welcoming you back soon!",
  "Thank you for choosing us! We appreciate your business and look forward to serving you again. Keep this receipt for any future inquiries or returns.",
  "Your purchase supports local businesses and helps us continue our mission. Thank you for being a valued customer. We hope to see you again soon!",
  "We hope you had a great shopping experience today. If you have any feedback, please share it with us on our website. We are always here to assist you.",
  "Thank you for your visit! Remember, we offer exclusive discounts to returning customers. Check your email for special offers on your next purchase.",
  "Your satisfaction is our top priority. If you need any help or have questions about your purchase, don't hesitate to contact us. Have a great day!",
  "We love our customers! Thank you for supporting our business. Follow us on social media for updates on promotions and new products. See you next time!",
  "Every purchase counts! We are committed to making a positive impact, and your support helps us achieve our goals. Thank you for shopping with us today!",
  "We hope you found everything you needed. If not, please let us know so we can improve your experience. Your feedback helps us serve you better. Thank you!",
  "Thank you for visiting! Did you know you can save more with our rewards program? Ask about it during your next visit and start earning points today!",
  "We appreciate your trust in us. If you ever need assistance with your order, please visit our website or call customer service. We're here to help!",
];

const Invoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [userSettings, setUserSettings] = useState(null);
  const [billTo, setBillTo] = useState({ name: "", address: "", phone: "", email: "", company: "", tax_id: "" });
  const [shipTo, setShipTo] = useState({ name: "", address: "", phone: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isManualCustomerMode, setIsManualCustomerMode] = useState(false);
  const [pendingCustomerId, setPendingCustomerId] = useState(null);
  const [invoice, setInvoice] = useState({
    date: "",
    paymentDate: "",
    number: "",
  });
  const [yourCompany, setYourCompany] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [items, setItems] = useState([]);
  const [taxPercentage, settaxPercentage] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [notes, setNotes] = useState("");

  const refreshNotes = () => {
    const randomIndex = Math.floor(Math.random() * noteOptions.length);
    setNotes(noteOptions[randomIndex]);
  };

  // Load user settings and initialize form
  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true);
      try {
        // Load user settings from database
        const settings = await userSettingsService.getUserSettings();
        setUserSettings(settings);
        
        // Check if invoice data was passed from dashboard
        if (location.state && location.state.invoiceData) {
          const invoiceData = location.state.invoiceData;
          setBillTo(invoiceData.billTo || { name: "", address: "", phone: "" });
          setShipTo(invoiceData.shipTo || { name: "", address: "", phone: "" });
          setInvoice(invoiceData.invoice || { date: "", paymentDate: "", number: "" });
          setYourCompany(invoiceData.yourCompany || { name: "", address: "", phone: "" });
          setItems(invoiceData.items || []);
          settaxPercentage(invoiceData.taxPercentage || 0);
          setTaxAmount(invoiceData.taxAmount || 0);
          setSubTotal(invoiceData.subTotal || 0);
          setGrandTotal(invoiceData.grandTotal || 0);
          setNotes(invoiceData.notes || "");
          setSelectedCurrency(invoiceData.selectedCurrency || settings?.default_currency || "USD");
        } else {
          // Initialize with user settings and generate new invoice number
          setSelectedCurrency(settings?.default_currency || "USD");
          settaxPercentage(settings?.default_tax_rate || 0);
          setYourCompany({
            name: settings?.company_name || "",
            address: settings?.company_address || "",
            phone: settings?.company_phone || "",
          });
          
          // Generate new invoice number using database service
          const invoiceNumber = await userSettingsService.generateInvoiceNumber();
          setInvoice((prev) => ({
            ...prev,
            number: invoiceNumber,
          }));
        }
      } catch (error) {
        console.error('Error initializing form:', error);
        // Fallback to random number generation if database fails
        setInvoice((prev) => ({
          ...prev,
          number: generateRandomInvoiceNumber(),
        }));
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [location.state]);

  // No longer need to save to localStorage - data is managed in state only

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
    updateTotals();
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

  const calculateSubTotal = useCallback(() => {
    const calculatedSubTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.amount,
      0
    );
    setSubTotal(calculatedSubTotal); // Store as number
    return calculatedSubTotal;
  }, [items]);

  const calculateTaxAmount = useCallback((subTotalValue) => {
    // Renamed param to avoid conflict with state
    const tax = (subTotalValue * taxPercentage) / 100;
    setTaxAmount(tax); // Store as number
    return tax;
  }, [taxPercentage]);

  const calculateGrandTotal = useCallback((subTotalValue, taxAmountValue) => {
    // Renamed params to avoid conflict with state
    const total = parseFloat(subTotalValue) + parseFloat(taxAmountValue);
    setGrandTotal(total); // Store as number
    return total;
  }, []);

  const updateTotals = useCallback(() => {
    const currentSubTotal = calculateSubTotal();
    const currentTaxAmount = calculateTaxAmount(currentSubTotal);
    // setGrandTotal will be called by calculateGrandTotal via currentTaxAmount's setter,
    // or directly if we prefer explicit calls.
    // For clarity and directness, let's call it explicitly here.
    calculateGrandTotal(currentSubTotal, currentTaxAmount);
    // Note: setSubTotal and setTaxAmount are called within their respective calculate functions.
  }, [calculateSubTotal, calculateTaxAmount, calculateGrandTotal]);

  const handleTaxPercentageChange = (e) => {
    const taxRate = parseFloat(e.target.value) || 0;
    settaxPercentage(taxRate);
    // updateTotals will be called by the useEffect listening to taxPercentage change
  };

  useEffect(() => {
    updateTotals();
  }, [items, taxPercentage, updateTotals]); // subTotal, taxAmount, grandTotal removed from deps as they are set by updateTotals & its chain

  const handleTemplateClick = (templateNumber) => {
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
      notes,
      selectedCurrency, // Add this
    };
    navigate("/template", {
      state: { formData, selectedTemplate: templateNumber },
    });
  };

  const fillDummyData = () => {
    setBillTo({
      name: "John Doe",
      address: "123 Main St, Anytown, USA",
      phone: "(555) 123-4567",
      email: "john.doe@example.com",
      company: "Doe Enterprises",
      tax_id: "TAX123456789"
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
      number: generateRandomInvoiceNumber(),
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
      {
        name: "Service D",
        description: "Another professional service",
        quantity: 2,
        amount: 150,
        total: 300,
      },
      {
        name: "Product E",
        description: "Yet another product",
        quantity: 1,
        amount: 75,
        total: 75,
      },
      {
        name: "Service F",
        description: "Yet another service",
        quantity: 4,
        amount: 100,
        total: 400,
      },
    ]);
    settaxPercentage(10);
    calculateSubTotal();
    setNotes("Thank you for your business!");
  };

  const clearForm = async () => {
    try {
      // Generate new invoice number from database
      const newInvoiceNumber = await userSettingsService.generateInvoiceNumber();
      
      setBillTo({ name: "", address: "", phone: "", email: "", company: "", tax_id: "" });
      setShipTo({ name: "", address: "", phone: "" });
      setSelectedCustomer(null);
      setIsManualCustomerMode(false);
      setPendingCustomerId(null);
      setInvoice({
        date: "",
        paymentDate: "",
        number: newInvoiceNumber,
      });
      
      // Keep user's company information and settings
      setYourCompany({
        name: userSettings?.company_name || "",
        address: userSettings?.company_address || "",
        phone: userSettings?.company_phone || "",
      });
      setItems([{ name: "", description: "", quantity: 0, amount: 0, total: 0 }]);
      settaxPercentage(userSettings?.default_tax_rate || 0);
      setSelectedCurrency(userSettings?.default_currency || "USD");
      setNotes("");
    } catch (error) {
      console.error('Error clearing form:', error);
      // Fallback to random number if database fails
      setInvoice({
        date: "",
        paymentDate: "",
        number: generateRandomInvoiceNumber(),
      });
    }
  };

  // Handle customer selection from Smart Customer Selector
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    
    if (customer) {
      // Auto-fill customer data into billTo
      setBillTo({
        name: customer.name || '',
        address: customer.address || '',
        phone: customer.phone || '',
        email: customer.email || '',
        company: customer.company || '',
        tax_id: customer.tax_id || ''
      });
      
      // Store customer ID for later use when saving
      if (!customer.isNewCustomer) {
        setPendingCustomerId(customer.id);
      } else {
        setPendingCustomerId(null);
      }
    }
  };

  // Handle manual customer mode toggle
  const handleManualModeChange = (isManual) => {
    setIsManualCustomerMode(isManual);
    if (!isManual) {
      setSelectedCustomer(null);
      setPendingCustomerId(null);
      setBillTo({ name: "", address: "", phone: "", email: "", company: "", tax_id: "" });
    }
  };

  // Create new customer when saving invoice
  const createNewCustomerIfNeeded = async (customerData) => {
    if (!selectedCustomer?.isNewCustomer || !customerData.name) {
      return pendingCustomerId;
    }

    try {
      const newCustomer = await customerService.createCustomer({
        name: customerData.name,
        email: customerData.email,
        company: customerData.company,
        address: customerData.address,
        phone: customerData.phone,
        tax_id: customerData.tax_id
      });
      
      return newCustomer.id;
    } catch (error) {
      console.error('Error creating new customer:', error);
      throw error;
    }
  };

  const saveInvoice = async () => {
    try {
      // Create new customer if needed and get customer ID
      const customerId = await createNewCustomerIfNeeded(billTo);
      
      // Prepare invoice data for database
      const invoiceData = {
        invoice_number: invoice.number,
        date: invoice.date || new Date().toISOString().split('T')[0],
        due_date: invoice.paymentDate,
        subtotal: subTotal,
        tax: taxAmount,
        total: grandTotal,
        notes,
        
        // Add customer information
        customer_id: customerId,
        customer_name: billTo.name,
        customer_email: billTo.email,
        customer_company: billTo.company,
        customer_address: billTo.address,
        customer_phone: billTo.phone,
        customer_tax_id: billTo.tax_id,
        
        // Prepare items for database
        items: items.map(item => ({
          description: item.name + (item.description ? ' - ' + item.description : ''),
          quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.amount) || 0,
          total: parseFloat(item.total) || 0
        }))
      };

      // Try to create or update the invoice in database
      const savedInvoice = await invoiceService.createInvoice(invoiceData);
      
      // Show visual feedback
      const saveButtons = document.querySelectorAll('.save-invoice-btn');
      saveButtons.forEach(button => {
        const originalText = button.textContent || button.querySelector('span')?.textContent;
        const textElement = button.querySelector('span') || button;
        if (textElement) {
          textElement.textContent = t('index.saved');
          button.style.backgroundColor = '#10b981';
          setTimeout(() => {
            textElement.textContent = originalText;
            button.style.backgroundColor = '';
          }, 2000);
        }
      });

      return savedInvoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      
      // Show error feedback
      const saveButtons = document.querySelectorAll('.save-invoice-btn');
      saveButtons.forEach(button => {
        const originalText = button.textContent || button.querySelector('span')?.textContent;
        const textElement = button.querySelector('span') || button;
        if (textElement) {
          textElement.textContent = 'Error saving';
          button.style.backgroundColor = '#ef4444';
          setTimeout(() => {
            textElement.textContent = originalText;
            button.style.backgroundColor = '';
          }, 2000);
        }
      });
      
      throw error;
    }
  };

  const sendViaEmail = async () => {
    try {
      // First save the invoice
      await saveInvoice();

      // Create email content
      const emailSubject = `Invoice ${invoice.number} from ${yourCompany.name || 'Your Company'}`;
      const emailBody = `Dear ${billTo.name || 'Customer'},

Please find attached your invoice details:

Invoice Number: ${invoice.number}
Invoice Date: ${invoice.date}
Due Date: ${invoice.dueDate}
Amount: ${formatCurrency(grandTotal, selectedCurrency)}

${notes ? `Notes: ${notes}` : ''}

Thank you for your business!

Best regards,
${yourCompany.name || 'Your Company'}
${yourCompany.phone || ''}
${yourCompany.email || ''}`;

      // Update invoice status to "sent" in database
      try {
        await invoiceService.updateInvoiceStatus(invoice.number, 'sent');
      } catch (error) {
        console.error('Error updating invoice status:', error);
      }

      // Open email client
      const mailtoLink = `mailto:${billTo.email || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoLink, '_blank');
      
      // Show visual feedback
      const emailButtons = document.querySelectorAll('.send-email-btn');
      emailButtons.forEach(button => {
        const originalText = button.textContent || button.querySelector('span')?.textContent;
        const textElement = button.querySelector('span') || button;
        if (textElement) {
          textElement.textContent = t('index.emailSent');
          button.style.backgroundColor = '#10b981';
          setTimeout(() => {
            textElement.textContent = originalText;
            button.style.backgroundColor = '';
          }, 2000);
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Show error feedback
      const emailButtons = document.querySelectorAll('.send-email-btn');
      emailButtons.forEach(button => {
        const originalText = button.textContent || button.querySelector('span')?.textContent;
        const textElement = button.querySelector('span') || button;
        if (textElement) {
          textElement.textContent = 'Error sending';
          button.style.backgroundColor = '#ef4444';
          setTimeout(() => {
            textElement.textContent = originalText;
            button.style.backgroundColor = '';
          }, 2000);
        }
      });
    }
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
   
        
        {/* Main content layout */}
       <div className="container mx-auto px-4 md:px-12 py-5">
        {/* French Invoice CTA - Top Priority */}
        <FrenchInvoiceCTA />
          {/* Invoice Dashboard */}
          <InvoiceDashboard />
          
          {/*    <FrenchInvoicePage... To be added here  /> */}
          {/* NOTE: Everything below this line has been commented out intentionally. */}
          
    
       
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={fillDummyData}
              className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all"
            >
              <FiEdit size={18} />
              <span>{t('index.fillDummyData')}</span>
            </Button>
            <Button
              variant="default"
              onClick={() => saveInvoice().catch(console.error)}
              className="save-invoice-btn flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-all"
            >
              <Save size={18} />
              <span>{t('index.saveInvoice')}</span>
            </Button>
            <Button
              variant="default"
              onClick={sendViaEmail}
              className="send-email-btn flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all"
            >
              <Mail size={18} />
              <span>{t('index.sendViaEmail')}</span>
            </Button>
            <Button
              variant="destructive"
              onClick={clearForm}
              className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all"
            >
              <FiTrash2 size={18} />
              <span>{t('index.clearForm')}</span>
            </Button>
          </div>
          
          <div className="flex flex-col xl:flex-row gap-8"> 
          {/* Invoice Form Container */}
          <div className="w-full xl:w-1/2 invoice-form-section"> 
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
            {/* Invoice Form Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t('index.createInvoiceForm')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('index.createInvoiceDescription')}
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {/* Smart Customer Selector */}
              <div className="mb-8">
                <SmartCustomerSelector
                  onCustomerSelect={handleCustomerSelect}
                  selectedCustomer={selectedCustomer}
                  onManualModeChange={handleManualModeChange}
                  isManualMode={isManualCustomerMode}
                />
              </div>

              <BillToSection
                billTo={billTo}
                handleInputChange={handleInputChange(setBillTo)}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
              />
              <ShipToSection
                shipTo={shipTo}
                handleInputChange={handleInputChange(setShipTo)}
                billTo={billTo}
              />

              <div
                className="card-modern animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <h2 className="text-2xl font-semibold mb-6 gradient-text">
                  {t('index.invoiceInformation')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingLabelInput
                    id="invoiceNumber"
                    label="Invoice Number"
                    value={invoice.number}
                    onChange={handleInputChange(setInvoice)}
                    name="number"
                  />
                  <FloatingLabelInput
                    id="invoiceDate"
                    label="Invoice Date"
                    type="date"
                    value={invoice.date}
                    onChange={handleInputChange(setInvoice)}
                    name="date"
                  />
                  <FloatingLabelInput
                    id="paymentDate"
                    label="Payment Date"
                    type="date"
                    value={invoice.paymentDate}
                    onChange={handleInputChange(setInvoice)}
                    name="paymentDate"
                  />
                </div>
              </div>

              <div
                className="card-modern animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <h2 className="text-2xl font-semibold mb-6 gradient-text">
                  {t('index.yourCompany')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingLabelInput
                    id="yourCompanyName"
                    label="Name"
                    value={yourCompany.name}
                    onChange={handleInputChange(setYourCompany)}
                    name="name"
                  />
                  <FloatingLabelInput
                    id="yourCompanyPhone"
                    label="Phone"
                    value={yourCompany.phone}
                    onChange={handleInputChange(setYourCompany)}
                    name="phone"
                  />
                </div>
                <FloatingLabelInput
                  id="yourCompanyAddress"
                  label="Address"
                  value={yourCompany.address}
                  onChange={handleInputChange(setYourCompany)}
                  name="address"
                  className="mt-4"
                />
              </div>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <ItemDetails
                items={items}
                handleItemChange={handleItemChange}
                addItem={addItem}
                removeItem={removeItem}
                currencyCode={selectedCurrency}
              />
            </div>

            <div
              className="card-modern animate-fade-in"
              style={{ animationDelay: "1s" }}
            >
              <h3 className="text-lg font-semibold mb-4 gradient-text">
                {t('index.totals')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">{t('index.subTotal')}:</span>
                  <span className="font-medium">
                    {formatCurrency(subTotal, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">{t('index.taxRate')}:</span>
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => handleTaxPercentageChange(e)}
                    className="w-24 px-3 py-2 border border-border rounded-lg bg-input transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
                    min="0"
                    max="28"
                    step="1"
                  />
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">{t('index.taxAmount')}:</span>
                  <span className="font-medium">
                    {formatCurrency(taxAmount, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg border border-primary/20">
                  <span className="font-bold text-primary">{t('index.grandTotal')}:</span>
                  <span className="font-bold text-xl text-primary">
                    {formatCurrency(grandTotal, selectedCurrency)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="card-modern animate-fade-in mt-8"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-semibold gradient-text">{t('index.notes')}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshNotes}
                  className="ml-3 rounded-full hover:scale-110"
                  title={t('index.refreshNotes')}
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border/30 rounded-xl bg-input/50 transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none hover:border-border/50"
                rows="4"
                placeholder={t('index.notesPlaceholder')}
              ></textarea>
            </div>

            {/* Save Invoice Button at form end */}
            <div className="mt-8 text-center">
              <Button
                onClick={() => saveInvoice().catch(console.error)}
                className="save-invoice-btn px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:scale-105 transition-all shadow-lg"
                size="lg"
              >
                <Save size={20} className="mr-2" />
                <span>{t('index.saveInvoice')}</span>
              </Button>
            </div>

            {/* Clear Form button removed */}
          </div>
        </div>
        <div className="w-full xl:w-1/2">
          <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('index.chooseTemplate')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="glass-card p-4 rounded-2xl cursor-pointer hover:shadow-xl transition-smooth hover:scale-105 hover:-translate-y-1 group animate-fade-in border-2 border-transparent hover:border-accent/30"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  onClick={() => handleTemplateClick(index + 1)}
                >
                  <div className="relative overflow-hidden rounded-xl mb-3 bg-gradient-to-br from-muted/50 to-muted">
                    <img
                      src={`/assets/template${index + 1}-preview.png`}
                      alt={template.name}
                      className={`w-full ${
                        template.name === "Template 10"
                          ? "h-[38px] w-[57px]"
                          : "h-50"
                      } object-cover transition-smooth group-hover:scale-110`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-smooth"></div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth">
                      <div className="w-6 h-6 bg-accent/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center font-semibold text-foreground group-hover:gradient-text transition-smooth">
                    {template.name}
                  </p>
                </div>
              ))}

              {/* Template Selection Help */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h- bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-medium">
                      {t('index.templateSelectionTip')}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {t('index.templateSelectionHelp')}
                    </p>
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
};export default Invoice;