import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils/formatCurrency"; // Corrected import path
import FloatingLabelInput from "../components/FloatingLabelInput";
import BillToSection from "../components/BillToSection";
import ShipToSection from "../components/ShipToSection";
import ItemDetails from "../components/ItemDetails";
import { templates } from "../utils/templateRegistry";
import { FiEdit, FiFileText, FiTrash2 } from "react-icons/fi"; // Added FiTrash2 icon
import { RefreshCw } from "lucide-react";

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

const Index = () => {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [billTo, setBillTo] = useState({ name: "", address: "", phone: "" });
  const [shipTo, setShipTo] = useState({ name: "", address: "", phone: "" });
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

  useEffect(() => {
    // Load form data from localStorage on component mount
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setBillTo(parsedData.billTo || { name: "", address: "", phone: "" });
      setShipTo(parsedData.shipTo || { name: "", address: "", phone: "" });
      setInvoice(
        parsedData.invoice || { date: "", paymentDate: "", number: "" }
      );
      setYourCompany(
        parsedData.yourCompany || { name: "", address: "", phone: "" }
      );
      setItems(parsedData.items || []);
      settaxPercentage(parsedData.taxPercentage || 0);
      setNotes(parsedData.notes || "");
      setSelectedCurrency(parsedData.selectedCurrency || "USD"); // Load selectedCurrency from localStorage
    } else {
      // If no saved data, set invoice number
      setInvoice((prev) => ({
        ...prev,
        number: generateRandomInvoiceNumber(),
      }));
    }
  }, []);

  useEffect(() => {
    // Save form data to localStorage whenever it changes
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
      selectedCurrency, // Add selectedCurrency to localStorage
    };
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [
    billTo,
    shipTo,
    invoice,
    yourCompany,
    items,
    taxPercentage,
    notes,
    taxAmount,
    subTotal,
    grandTotal,
    selectedCurrency, // Add selectedCurrency to localStorage dependency array
  ]);

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

  const calculateSubTotal = () => {
    const calculatedSubTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.amount,
      0
    );
    setSubTotal(calculatedSubTotal); // Store as number
    return calculatedSubTotal;
  };

  const calculateTaxAmount = (subTotalValue) => {
    // Renamed param to avoid conflict with state
    const tax = (subTotalValue * taxPercentage) / 100;
    setTaxAmount(tax); // Store as number
    return tax;
  };

  const calculateGrandTotal = (subTotalValue, taxAmountValue) => {
    // Renamed params to avoid conflict with state
    const total = parseFloat(subTotalValue) + parseFloat(taxAmountValue);
    setGrandTotal(total); // Store as number
    return total;
  };

  const updateTotals = () => {
    const currentSubTotal = calculateSubTotal();
    const currentTaxAmount = calculateTaxAmount(currentSubTotal);
    // setGrandTotal will be called by calculateGrandTotal via currentTaxAmount's setter,
    // or directly if we prefer explicit calls.
    // For clarity and directness, let's call it explicitly here.
    calculateGrandTotal(currentSubTotal, currentTaxAmount);
    // Note: setSubTotal and setTaxAmount are called within their respective calculate functions.
  };

  const handleTaxPercentageChange = (e) => {
    const taxRate = parseFloat(e.target.value) || 0;
    settaxPercentage(taxRate);
    // updateTotals will be called by the useEffect listening to taxPercentage change
  };

  useEffect(() => {
    updateTotals();
  }, [items, taxPercentage]); // subTotal, taxAmount, grandTotal removed from deps as they are set by updateTotals & its chain

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

  const clearForm = () => {
    setBillTo({ name: "", address: "", phone: "" });
    setShipTo({ name: "", address: "", phone: "" });
    setInvoice({
      date: "",
      paymentDate: "",
      number: generateRandomInvoiceNumber(),
    });
    setYourCompany({ name: "", address: "", phone: "" });
    setItems([{ name: "", description: "", quantity: 0, amount: 0, total: 0 }]);
    settaxPercentage(0);
    setNotes("");
    localStorage.removeItem("formData");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
   
        {/* Floating action buttons */}
        <div className="fixed top-20 left-2 md:left-8 flex flex-col gap-3 z-40">
          <Button
            variant="destructive"
            size="icon"
            onClick={clearForm}
            className="rounded-sm p-1 hover:scale-110 transition-smooth mt-8 w-auto text-black text-md font-bold"
            title="Clear Form"
          >
            <span className="sr-only">Clear Form</span>
            <FiTrash2 className="w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fillDummyData}
            className="rounded-full hover:scale-110 transition-smooth"
            title="Fill with Dummy Data"
          >
            <FiEdit size={20} />
          </Button>
        </div>
        <Button
          variant="accent"
          size="icon"
          onClick={() =>
            navigate("/receipt", {
              state: {
                formData: {
                  billTo,
                  shipTo,
                  invoice,
                  yourCompany,
                  items,
                  taxPercentage,
                  notes,
                  selectedCurrency,
                },
              },
            })
          }
          className="fixed top-20 right-4 rounded-md z-40 mt-8 w-auto p-2 text-black text-xl font-bold hover:scale-110 transition-smooth"
          title="Switch to Receipt Generator"
        >
          <span className="sr-only">Receipt Generator</span>{" "}
          <FiFileText size={20} />
        </Button>
        
        {/* Main content layout */}
       <div className="container mx-auto px-4 md:px-12 py-5">
          <div className="flex flex-col xl:flex-row gap-8"> 
          {/* Invoice Form Container */}
          <div className="w-full xl:w-1/2"> 
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
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
                  Invoice Information
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
                  Your Company
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
                Totals
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Sub Total:</span>
                  <span className="font-medium">
                    {formatCurrency(subTotal, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Tax Rate (%):</span>
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
                  <span className="text-muted-foreground">Tax Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(taxAmount, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg border border-primary/20">
                  <span className="font-bold text-primary">Grand Total:</span>
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
                <h3 className="text-lg font-semibold gradient-text">Notes</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshNotes}
                  className="ml-3 rounded-full hover:scale-110"
                  title="Refresh Notes"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border/30 rounded-xl bg-input/50 transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none hover:border-border/50"
                rows="4"
                placeholder="Add notes or special instructions..."
              ></textarea>
            </div>

            {/* Clear Form button removed */}
          </div>
        </div>
        <div className="w-full xl:w-1/2">
          <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Choose Template
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
                      Template Selection Tip
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Click on any template to preview how your invoice will
                      look. You can change templates at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div></div>
  
  );
};

export default Index;
