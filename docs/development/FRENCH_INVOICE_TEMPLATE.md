# French Invoice Template Documentation

## Overview

The `FrenchInvoiceTemplate` is a fully customizable React component that generates professional French-style invoices with complete control over section visibility and formatting.

## Features

- 🇫🇷 **French-style layout** with professional design
- 🎛️ **Full customization** - hide/show any section or table column
- 📄 **PDF export** with exact visual reproduction
- 💰 **Multi-currency support** with proper localization
- 📱 **Responsive design** for web and print
- 🔧 **Flexible data structure** for various invoice types

## Basic Usage

```jsx
import FrenchInvoiceTemplate from './components/templates/FrenchInvoiceTemplate';

const MyInvoice = () => {
  const invoiceData = {
    number: 'FACT-2024-001',
    date: '2024-10-04',
    dueDate: '2024-11-04',
    // ... more data
  };

  return (
    <FrenchInvoiceTemplate 
      invoiceData={invoiceData}
      showInvoiceNumber={true}
      showDueDate={true}
      showTotals={true}
      hideColumns={['Date']}
      currency="€"
      locale="fr-FR"
      enablePdfExport={true}
    />
  );
};
```

## Props Reference

### Invoice Data Structure

```typescript
invoiceData = {
  // Header information
  number: string,           // Invoice number
  date: string,            // Invoice date (ISO format)
  dueDate?: string,        // Due date (ISO format)
  operationType?: string,  // Type of operation
  orderNumber?: string,    // Order/command number
  
  // Sender information
  sender: {
    name: string,
    address: string,
    postalCode: string,
    city: string,
    phone?: string,
    email?: string,
    siret?: string,        // French business registration
    tva?: string           // VAT number
  },
  
  // Receiver information
  receiver: {
    name: string,
    address: string,
    postalCode: string,
    city: string,
    phone?: string,
    email?: string
  },
  
  // Invoice items
  items: Array<{
    description: string,
    date?: string,         // Item date
    quantity: number,
    unit?: string,         // Unit of measurement
    unitPrice: number,
    vatRate: number,       // VAT percentage
    amount: number         // Total amount for this item
  }>,
  
  // Payment information
  payment?: {
    bank: string,
    iban: string,
    bic?: string
  },
  
  // Additional information
  notes?: string,          // Invoice notes
  terms?: string           // Terms and conditions
}
```

### Visibility Control Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showInvoiceNumber` | boolean | true | Show/hide invoice number |
| `showDueDate` | boolean | true | Show/hide due date |
| `showOperationType` | boolean | true | Show/hide operation type |
| `showOrderNumber` | boolean | true | Show/hide order number |
| `showSenderInfo` | boolean | true | Show/hide sender information block |
| `showReceiverInfo` | boolean | true | Show/hide receiver information block |
| `showTotals` | boolean | true | Show/hide totals section |
| `showPaymentInfo` | boolean | true | Show/hide payment information |
| `showFooter` | boolean | true | Show/hide footer section |
| `showNotes` | boolean | true | Show/hide notes |
| `showTerms` | boolean | true | Show/hide terms and conditions |

### Table Column Control

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hideColumns` | string[] | [] | Array of column names to hide: ['Date', 'Qty', 'Unit', 'VAT'] |

### Format and Currency

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currency` | string | '€' | Currency symbol |
| `locale` | string | 'fr-FR' | Locale for number and date formatting |

### PDF Export

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enablePdfExport` | boolean | true | Enable/disable PDF export functionality |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | '' | Additional CSS classes for the container |

## Usage Examples

### Complete Invoice

```jsx
<FrenchInvoiceTemplate 
  invoiceData={fullInvoiceData}
  showInvoiceNumber={true}
  showDueDate={true}
  showOperationType={true}
  showOrderNumber={true}
  showSenderInfo={true}
  showReceiverInfo={true}
  showTotals={true}
  showPaymentInfo={true}
  showFooter={true}
  showNotes={true}
  showTerms={true}
  hideColumns={[]}
  currency="€"
  locale="fr-FR"
  enablePdfExport={true}
/>
```

### Simplified Invoice

```jsx
<FrenchInvoiceTemplate 
  invoiceData={simpleData}
  showInvoiceNumber={true}
  showDueDate={false}
  showOperationType={false}
  showOrderNumber={false}
  showPaymentInfo={false}
  showFooter={false}
  hideColumns={['Date', 'Unit', 'VAT']}
  currency="€"
  locale="fr-FR"
/>
```

### Quote/Estimate

```jsx
<FrenchInvoiceTemplate 
  invoiceData={quoteData}
  showInvoiceNumber={true}
  showDueDate={true}
  showOperationType={true}
  showPaymentInfo={false}
  showTerms={false}
  hideColumns={['Date']}
  currency="€"
  locale="fr-FR"
/>
```

### US Format

```jsx
<FrenchInvoiceTemplate 
  invoiceData={usData}
  currency="$"
  locale="en-US"
  // ... other props
/>
```

## Quick Presets

You can create preset configurations for common invoice types:

```jsx
// Preset configurations
const INVOICE_PRESETS = {
  COMPLETE: {
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
    hideColumns: []
  },
  
  SIMPLIFIED: {
    showInvoiceNumber: true,
    showDueDate: false,
    showOperationType: false,
    showOrderNumber: false,
    showPaymentInfo: false,
    showFooter: false,
    hideColumns: ['Date', 'Unit', 'VAT']
  },
  
  QUOTE: {
    showInvoiceNumber: true,
    showDueDate: true,
    showOperationType: true,
    showPaymentInfo: false,
    showTerms: false,
    hideColumns: ['Date']
  }
};

// Usage with presets
<FrenchInvoiceTemplate 
  invoiceData={data}
  {...INVOICE_PRESETS.SIMPLIFIED}
  currency="€"
  locale="fr-FR"
/>
```

## Styling and Customization

The template uses Tailwind CSS classes for styling. Key design features:

- **Professional layout** with clean borders and proper spacing
- **Print-optimized** formatting with appropriate margins
- **Responsive design** that works on all screen sizes
- **Minimalist aesthetic** with light gray borders and proper typography
- **Color-coded sections** for better visual organization

### Custom Styling

You can add custom styles via the `className` prop:

```jsx
<FrenchInvoiceTemplate 
  invoiceData={data}
  className="my-custom-invoice"
  // ... other props
/>
```

## PDF Export Features

The PDF export functionality:

- **Exact visual reproduction** of the displayed invoice
- **High-quality output** with 2x scale for crisp text
- **Multi-page support** for long invoices
- **Custom filename** based on invoice number
- **Error handling** with user feedback

The export uses `html2canvas` and `jsPDF` libraries to generate PDFs that match exactly what's displayed on screen.

## Dependencies Required

Make sure these packages are installed:

```bash
npm install html2canvas jspdf lucide-react
```

## Browser Compatibility

The template works in all modern browsers that support:
- ES6+ features
- Canvas API (for PDF export)
- CSS Grid and Flexbox

## Performance Considerations

- The PDF export process is asynchronous and shows loading state
- Large invoices with many items render efficiently
- Images and complex layouts are handled properly in PDF export

## Contributing

When extending the template:

1. **Maintain French business standards** for layout and required fields
2. **Ensure PDF export compatibility** when adding new sections
3. **Test responsive behavior** on various screen sizes
4. **Follow accessibility guidelines** for form elements and navigation
5. **Update documentation** for any new props or features

## License

This component is part of the SwiftFacture project and follows the same licensing terms.