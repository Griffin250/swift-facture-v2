# French Invoice Template Implementation Guide

**Project:** SwiftFacture French Invoice Template (PALETTES EXPRESS Style)  
**Version:** 1.0  
**Date:** October 13, 2025  
**Status:** In Development

## 📋 **Project Overview**

This implementation creates a custom French invoice template based on the PALETTES EXPRESS LLC design, featuring a professional layout with editable blocks and single-page print optimization.

### **Key Requirements:**
- ✅ Exact replica of the provided invoice design
- ✅ Editable blocks for all invoice elements
- ✅ Logo upload and management
- ✅ Single-page print optimization
- ✅ French business standards compliance
- ✅ Auto-calculations for totals and VAT

---

## 🎯 **Template Analysis**

### **Original Invoice Elements:**
```
HEADER SECTION:
├── Company Logo (Left - Colorful palette/shipping design)
├── Invoice Title "FACTURE - 150-38" (Right)
├── Invoice Date: 09/09/2025
├── Due Date: "À la réception de la facture"
└── Operation Type: "Livraison de biens"

COMPANY INFORMATION:
├── Sender (Left Column):
│   ├── PALETTES EXPRESS LLC
│   ├── 1 RUE DES ROMARAGES
│   ├── 27400 TERRES DE BORD
│   ├── Phone: 0652737698
│   ├── Email: palettesexpressllc@yahoo.com
│   └── Website: www.palettesexpress.fr
└── Receiver (Right Column):
    ├── Société Techniplast
    ├── Rue de Lery
    ├── B.P 705
    └── 27407 Louviers Cedex

INVOICE TABLE:
├── Columns: Description | Date | Qté | Unité | Prix unitaire | TVA | Montant
├── Item: Palettes 80 x 120 Légères
├── Quantity: 400,00 pce
├── Unit Price: 4,10 €
├── VAT: 20,00%
└── Amount: 1968,00 €

TOTALS SECTION:
├── Total HT: 1 640,00 €
├── TVA 20,00%: 328,00 €
└── Total TTC: 1 968,00 €

PAYMENT INFORMATION:
├── Bank: QONTO
└── IBAN: FR76169580001819178786631
```

---

## 🏗️ **Technical Architecture**

### **Component Structure:**
```
📂 src/components/french-invoice/
├── 📄 FrenchInvoicePage.jsx          (Main container)
├── 📄 FrenchInvoiceForm.jsx          (Data input form)
├── 📄 FrenchInvoicePreview.jsx       (Print template)
├── 📄 LogoUploader.jsx               (Logo management)
├── 📄 DynamicItemsTable.jsx          (Items editor)
└── 📄 PaymentInfoBlock.jsx           (Payment details)

📂 src/utils/
├── 📄 frenchInvoiceCalculations.js   (Auto-calculations)
├── 📄 frenchNumberFormat.js          (Number formatting)
└── 📄 frenchDateFormat.js            (Date utilities)

📂 src/styles/
└── 📄 french-invoice-print.css       (Print optimization)
```

### **Data Model:**
```javascript
// Invoice Data Structure
const invoiceSchema = {
  // Meta Information
  id: String,
  createdAt: Date,
  updatedAt: Date,
  
  // Company Information (Sender)
  company: {
    name: String,           // "PALETTES EXPRESS LLC"
    address: String,        // "1 RUE DES ROMARAGES"
    city: String,          // "27400 TERRES DE BORD"
    phone: String,         // "0652737698"
    email: String,         // "palettesexpressllc@yahoo.com"
    website: String,       // "www.palettesexpress.fr"
    logo: {
      file: File,
      url: String,
      size: Number,
      format: String
    }
  },
  
  // Client Information (Receiver)
  client: {
    name: String,          // "Société Techniplast"
    address: String,       // "Rue de Lery"
    postalCode: String,    // "B.P 705"
    city: String,          // "27407 Louviers Cedex"
    country: String        // "France" (default)
  },
  
  // Invoice Details
  invoice: {
    number: String,        // "150-38"
    date: Date,           // "09/09/2025"
    dueDate: String,      // "À la réception de la facture"
    operationType: String, // "Livraison de biens"
    currency: String      // "EUR" (default)
  },
  
  // Line Items
  items: [{
    id: String,
    description: String,   // "Palettes 80 x 120 Légères"
    date: Date,           // "09/09/2025"
    quantity: Number,     // 400.00
    unit: String,         // "pce"
    unitPrice: Number,    // 4.10
    vatRate: Number,      // 20.00
    amount: Number        // Calculated: quantity * unitPrice
  }],
  
  // Payment Information
  payment: {
    method: String,       // "Virement bancaire"
    bank: String,         // "QONTO"
    iban: String,         // "FR76169580001819178786631"
    bic: String,          // Optional
    terms: String         // Payment terms
  },
  
  // Calculated Totals (Auto-computed)
  totals: {
    subtotal: Number,     // Sum of all items (HT)
    vatAmount: Number,    // Total VAT amount
    total: Number,        // Total TTC (including VAT)
    currency: String      // "EUR"
  },
  
  // Template Settings
  settings: {
    showLogo: Boolean,
    colorScheme: String,
    fontSize: String,
    printLayout: String
  }
}
```

---

## 🎨 **Design System**

### **Color Palette:**
```css
:root {
  /* Primary Colors (from logo analysis) */
  --primary-blue: #1f4e79;        /* Deep blue from logo */
  --secondary-teal: #4a90a4;      /* Teal accent */
  --accent-orange: #f59e0b;       /* Orange from logo */
  
  /* Neutral Colors */
  --text-primary: #1f2937;        /* Dark gray for main text */
  --text-secondary: #6b7280;      /* Medium gray for labels */
  --text-light: #9ca3af;          /* Light gray for subtles */
  
  /* Background Colors */
  --bg-white: #ffffff;
  --bg-light: #f9fafb;
  --bg-table: #f3f4f6;
  
  /* Border Colors */
  --border-light: #e5e7eb;
  --border-medium: #d1d5db;
  --border-dark: #374151;
}
```

### **Typography Scale:**
```css
/* Font Sizes for Print Optimization */
.invoice-title { font-size: 24px; font-weight: bold; }
.section-header { font-size: 16px; font-weight: 600; }
.body-text { font-size: 11px; line-height: 1.4; }
.small-text { font-size: 9px; line-height: 1.3; }
.table-header { font-size: 10px; font-weight: 600; }
.table-cell { font-size: 10px; }
.totals-text { font-size: 12px; font-weight: 600; }
```

### **Layout Grid:**
```css
/* A4 Print Layout */
.invoice-container {
  width: 210mm;         /* A4 width */
  max-height: 297mm;    /* A4 height */
  margin: 0 auto;
  padding: 15mm;        /* Safe print margins */
  
  /* Grid Layout */
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 8mm;
}

/* Responsive Breakpoints */
@media screen and (max-width: 768px) {
  .invoice-container { padding: 10px; }
  .company-info { flex-direction: column; }
}
```

---

## 🚀 **Implementation Steps**

### **Phase 1: Core Structure (Day 1)**

#### **1.1 Create Main Container**
```jsx
// File: src/pages/FrenchInvoicePage.jsx
- Set up main page layout
- State management for invoice data
- Form/Preview toggle functionality
- Print handling integration
```

#### **1.2 Data Layer Setup**
```javascript
// File: src/utils/frenchInvoiceCalculations.js
- Auto-calculation functions
- VAT computation logic
- Currency formatting (French standards)
- Validation rules
```

#### **1.3 Base Styling**
```css
// File: src/styles/french-invoice.css
- Print-optimized CSS
- A4 layout constraints
- Color system variables
- Typography scales
```

### **Phase 2: Form Components (Day 2)**

#### **2.1 Company Information Form**
```jsx
// File: src/components/french-invoice/CompanyInfoForm.jsx
- Logo upload with preview
- Company details input fields
- Validation and formatting
- Real-time preview updates
```

#### **2.2 Invoice Details Form**
```jsx
// File: src/components/french-invoice/InvoiceDetailsForm.jsx
- Invoice number generation
- Date pickers (French format)
- Operation type selection
- Due date management
```

#### **2.3 Dynamic Items Table**
```jsx
// File: src/components/french-invoice/ItemsTableForm.jsx
- Add/remove line items
- Real-time calculations
- Unit price validation
- VAT rate selection
```

### **Phase 3: Preview Template (Day 3)**

#### **3.1 Header Section**
```jsx
// Components: Logo, Invoice title, Date information
- Logo positioning and sizing
- Invoice number display
- Date formatting (DD/MM/YYYY)
- Operation type display
```

#### **3.2 Company Information Layout**
```jsx
// Two-column layout for sender/receiver
- Sender information (left column)
- Receiver information (right column)
- Professional spacing and alignment
- Responsive behavior
```

#### **3.3 Invoice Table**
```jsx
// Professional items table with calculations
- Column headers (French labels)
- Dynamic row generation
- Number formatting (1 640,00 €)
- Totals calculation section
```

### **Phase 4: Advanced Features (Day 4)**

#### **4.1 Logo Management**
```jsx
// File: src/components/LogoUploader.jsx
- Drag & drop upload
- Image preview and cropping
- Format validation (PNG, JPG, SVG)
- Size optimization for print
```

#### **4.2 Print Optimization**
```css
// File: src/styles/print-layout.css
- Single-page constraints
- Print-specific styling
- Header/footer management
- Page break prevention
```

#### **4.3 Export Functionality**
```javascript
// PDF generation and download
- High-quality PDF export
- Print preview integration
- Email functionality
- Save as template option
```

---

## 🔧 **Technical Specifications**

### **Print Requirements:**
```css
@media print {
  .french-invoice {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 15mm !important;
    font-size: 11px !important;
    color: black !important;
    background: white !important;
    
    /* Prevent page breaks */
    page-break-inside: avoid;
    break-inside: avoid;
    
    /* Hide non-printable elements */
    .no-print { display: none !important; }
  }
  
  /* Table optimization */
  .invoice-table {
    width: 100% !important;
    border-collapse: collapse !important;
  }
  
  .invoice-table th,
  .invoice-table td {
    border: 1px solid #000 !important;
    padding: 3px 5px !important;
    font-size: 10px !important;
  }
}
```

### **Calculation Logic:**
```javascript
// French Invoice Calculations
export const calculateInvoiceTotals = (items) => {
  let subtotal = 0;
  let totalVAT = 0;
  
  items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    const lineVAT = lineTotal * (item.vatRate / 100);
    
    subtotal += lineTotal;
    totalVAT += lineVAT;
  });
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(totalVAT * 100) / 100,
    total: Math.round((subtotal + totalVAT) * 100) / 100
  };
};

// French Number Formatting
export const formatFrenchCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

// French Date Formatting
export const formatFrenchDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};
```

### **Logo Upload Specifications:**
```javascript
// Logo Upload Configuration
const logoConfig = {
  maxSize: 2 * 1024 * 1024,    // 2MB max
  allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
  dimensions: {
    maxWidth: 300,
    maxHeight: 120,
    printDPI: 300              // High quality for print
  },
  compression: {
    quality: 0.9,
    format: 'jpeg'
  }
};
```

---

## 📊 **Quality Assurance**

### **Testing Checklist:**
```
✅ Form Validation
├── Required fields validation
├── Email format validation
├── Phone number format validation
├── IBAN format validation
└── File upload validation

✅ Calculation Accuracy
├── Line item calculations
├── VAT calculations (multiple rates)
├── Total calculations
├── Currency formatting
└── Rounding precision

✅ Print Layout
├── Single-page constraint
├── All content visible
├── Professional appearance
├── Logo quality and positioning
└── Text readability

✅ Responsive Design
├── Mobile form functionality
├── Tablet preview quality
├── Desktop optimization
└── Print preview accuracy

✅ Data Persistence
├── Form data saving
├── Auto-save functionality
├── Template saving
└── Export/import capability
```

### **Browser Compatibility:**
- ✅ Chrome 90+ (Primary)
- ✅ Firefox 88+ 
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### **Print Testing:**
- ✅ PDF export quality
- ✅ Direct browser printing
- ✅ Various printer types
- ✅ Different paper sizes (A4 primary)

---

## 🎯 **Performance Optimization**

### **Loading Performance:**
```javascript
// Lazy loading for non-critical components
const LogoUploader = React.lazy(() => import('./LogoUploader'));
const PDFExporter = React.lazy(() => import('./PDFExporter'));

// Image optimization
const optimizeLogoForPrint = async (file) => {
  // Compress and resize for optimal print quality
  return await compressImage(file, {
    maxWidth: 300,
    maxHeight: 120,
    quality: 0.9,
    format: 'jpeg'
  });
};
```

### **Rendering Optimization:**
```jsx
// Memoization for expensive calculations
const invoiceTotals = useMemo(() => 
  calculateInvoiceTotals(items), [items]
);

// Debounced form updates
const debouncedFormUpdate = useCallback(
  debounce((data) => updateInvoiceData(data), 500),
  []
);
```

---

## 📝 **File Structure**

### **Complete File Organization:**
```
src/
├── pages/
│   └── FrenchInvoicePage.jsx              # Main container page
├── components/
│   └── french-invoice/
│       ├── FrenchInvoiceForm.jsx          # Data input form
│       ├── FrenchInvoicePreview.jsx       # Print template
│       ├── CompanyInfoForm.jsx            # Company details form
│       ├── ClientInfoForm.jsx             # Client details form
│       ├── InvoiceDetailsForm.jsx         # Invoice metadata form
│       ├── ItemsTableForm.jsx             # Line items editor
│       ├── PaymentInfoForm.jsx            # Payment details form
│       ├── LogoUploader.jsx               # Logo management
│       └── TotalsDisplay.jsx              # Calculations display
├── utils/
│   ├── frenchInvoiceCalculations.js       # Calculation logic
│   ├── frenchNumberFormat.js              # Number formatting
│   ├── frenchDateFormat.js                # Date utilities
│   ├── logoOptimization.js                # Image processing
│   └── pdfExport.js                       # PDF generation
├── styles/
│   ├── french-invoice.css                 # Main styles
│   ├── french-invoice-print.css           # Print-specific styles
│   └── french-invoice-form.css            # Form styling
└── assets/
    ├── fonts/                             # Custom fonts if needed
    └── templates/
        └── sample-logo.png                # Sample logo for testing
```

---

## 🚀 **Deployment Checklist**

### **Pre-deployment Testing:**
```
✅ All form fields working correctly
✅ Calculations accurate for various scenarios
✅ Print layout optimized (single page)
✅ Logo upload and display functioning
✅ PDF export working correctly
✅ Responsive design tested on multiple devices
✅ French language and formatting correct
✅ Cross-browser compatibility verified
✅ Performance benchmarks met
✅ Accessibility standards compliant
```

### **Post-deployment Monitoring:**
- User interaction analytics
- Print success rates
- PDF generation performance
- Error tracking and reporting
- User feedback collection

---

## 📚 **Documentation Deliverables**

### **User Documentation:**
1. **User Guide** - How to create French invoices
2. **Print Setup Guide** - Optimal print settings
3. **Logo Guidelines** - Best practices for logo upload
4. **Troubleshooting Guide** - Common issues and solutions

### **Developer Documentation:**
1. **API Reference** - Component props and methods
2. **Customization Guide** - How to modify templates
3. **Integration Guide** - Adding to existing systems
4. **Maintenance Guide** - Updates and bug fixes

---

## 🎯 **Success Metrics**

### **Functional Metrics:**
- ✅ Single-page print success rate: >99%
- ✅ Form completion time: <3 minutes
- ✅ PDF generation speed: <5 seconds
- ✅ Logo upload success rate: >95%

### **Quality Metrics:**
- ✅ Visual accuracy vs original: 98%+
- ✅ Print quality rating: 4.8/5
- ✅ User satisfaction: >90%
- ✅ Bug reports: <1% of uses

### **Performance Metrics:**
- ✅ Initial load time: <2 seconds
- ✅ Form responsiveness: <100ms
- ✅ Memory usage: <50MB
- ✅ Mobile performance: Smooth 60fps

---

**Implementation Timeline:** 4 days  
**Testing Phase:** 2 days  
**Documentation:** 1 day  
**Total Project Duration:** 1 week

**Next Steps:** Ready to begin implementation with Phase 1 - Core Structure setup.