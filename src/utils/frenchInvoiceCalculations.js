/**
 * French Invoice Calculation Utilities
 * Handles VAT calculations, totals, and French number formatting
 */

/**
 * Calculate invoice totals with French VAT standards
 * @param {Array} items - Array of invoice line items
 * @returns {Object} Calculated totals (subtotal, vatAmount, total)
 */
export const calculateInvoiceTotals = (items) => {
  if (!items || !Array.isArray(items)) {
    return { subtotal: 0, vatAmount: 0, total: 0 };
  }

  let subtotal = 0;
  let totalVAT = 0;

  items.forEach(item => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const vatRate = parseFloat(item.vatRate) || 0;
    
    // Calculate line total (excluding VAT)
    const lineTotal = quantity * unitPrice;
    
    // Calculate VAT for this line
    const lineVAT = lineTotal * (vatRate / 100);
    
    subtotal += lineTotal;
    totalVAT += lineVAT;
  });

  // Round to 2 decimal places for currency precision
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(totalVAT * 100) / 100,
    total: Math.round((subtotal + totalVAT) * 100) / 100
  };
};

/**
 * Calculate line item total
 * @param {Object} item - Line item object
 * @returns {number} Item total excluding VAT
 */
export const calculateLineTotal = (item) => {
  const quantity = parseFloat(item.quantity) || 0;
  const unitPrice = parseFloat(item.unitPrice) || 0;
  
  return Math.round((quantity * unitPrice) * 100) / 100;
};

/**
 * Calculate line item VAT amount
 * @param {Object} item - Line item object
 * @returns {number} VAT amount for the line
 */
export const calculateLineVAT = (item) => {
  const lineTotal = calculateLineTotal(item);
  const vatRate = parseFloat(item.vatRate) || 0;
  
  return Math.round((lineTotal * (vatRate / 100)) * 100) / 100;
};

/**
 * Format currency amount in French style
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export const formatFrenchCurrency = (amount, currency = 'EUR') => {
  if (isNaN(amount)) return '0,00 €';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number in French style (space as thousands separator)
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatFrenchNumber = (number, decimals = 2) => {
  if (isNaN(number)) return '0,00';
  
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format date in French style (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatFrenchDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Convert ISO date (YYYY-MM-DD) to French format (DD/MM/YYYY)
 * @param {string} isoDate - ISO date string
 * @returns {string} French formatted date string
 */
export const isoToFrenchDate = (isoDate) => {
  if (!isoDate) return '';
  return formatFrenchDate(isoDate);
};

/**
 * Convert French date (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 * @param {string} frenchDate - French formatted date string
 * @returns {string} ISO date string
 */
export const frenchToIsoDate = (frenchDate) => {
  if (!frenchDate) return '';
  
  const parts = frenchDate.split('/');
  if (parts.length !== 3) return '';
  
  const [day, month, year] = parts;
  const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  // Validate the date
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return '';
  
  return isoDate;
};

/**
 * Generate next invoice number based on current date and sequence
 * @param {string} prefix - Invoice number prefix
 * @param {number} sequence - Current sequence number
 * @returns {string} Generated invoice number
 */
export const generateInvoiceNumber = (prefix = 'SF', sequence = 1) => {
  const year = new Date().getFullYear();
  const seqStr = String(sequence).padStart(3, '0');
  
  return `${prefix}-${year}-${seqStr}`;
};

/**
 * Validate IBAN format (basic French IBAN validation)
 * @param {string} iban - IBAN to validate
 * @returns {boolean} True if IBAN format is valid
 */
export const validateIBAN = (iban) => {
  if (!iban) return false;
  
  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // French IBAN should be 27 characters and start with FR
  if (cleanIBAN.length !== 27 || !cleanIBAN.startsWith('FR')) {
    return false;
  }
  
  // Basic format check (FR + 2 digits + 23 alphanumeric characters)
  const ibanRegex = /^FR\d{2}[A-Z0-9]{23}$/;
  return ibanRegex.test(cleanIBAN);
};

/**
 * Format IBAN with spaces for display
 * @param {string} iban - IBAN to format
 * @returns {string} Formatted IBAN with spaces
 */
export const formatIBAN = (iban) => {
  if (!iban) return '';
  
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // Add space every 4 characters
  return cleanIBAN.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Calculate VAT breakdown by rate
 * @param {Array} items - Array of invoice line items
 * @returns {Array} VAT breakdown by rate
 */
export const calculateVATBreakdown = (items) => {
  const vatBreakdown = {};
  
  items.forEach(item => {
    const vatRate = parseFloat(item.vatRate) || 0;
    const lineTotal = calculateLineTotal(item);
    const lineVAT = calculateLineVAT(item);
    
    if (!vatBreakdown[vatRate]) {
      vatBreakdown[vatRate] = {
        rate: vatRate,
        baseAmount: 0,
        vatAmount: 0
      };
    }
    
    vatBreakdown[vatRate].baseAmount += lineTotal;
    vatBreakdown[vatRate].vatAmount += lineVAT;
  });
  
  // Convert to array and round values
  return Object.values(vatBreakdown).map(vat => ({
    rate: vat.rate,
    baseAmount: Math.round(vat.baseAmount * 100) / 100,
    vatAmount: Math.round(vat.vatAmount * 100) / 100
  }));
};

/**
 * Common French VAT rates
 */
export const FRENCH_VAT_RATES = [
  { value: 0, label: '0% (Exonéré)' },
  { value: 2.1, label: '2,1% (Presse)' },
  { value: 5.5, label: '5,5% (Réduit)' },
  { value: 10, label: '10% (Intermédiaire)' },
  { value: 20, label: '20% (Normal)' }
];

/**
 * Common invoice operation types in French
 */
export const OPERATION_TYPES = [
  'Vente de marchandises',
  'Prestation de services',
  'Livraison de biens',
  'Exportation',
  'Livraison intracommunautaire',
  'Autre opération'
];

/**
 * Common payment terms in French
 */
export const PAYMENT_TERMS = [
  'À la réception de la facture',
  'Paiement comptant',
  'À 30 jours',
  'À 60 jours',
  'À 90 jours',
  'Fin de mois',
  'Le 10 du mois suivant'
];

/**
 * Common units for invoice items
 */
export const COMMON_UNITS = [
  'pce', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'm²', 'm³', 
  'h', 'j', 'mois', 'année', 'lot', 'forfait'
];