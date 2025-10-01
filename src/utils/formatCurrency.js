export const formatCurrency = (amount, currencyCode = 'USD', minimumFractionDigits = 2) => {
  const localeMap = {
    'USD': 'en-US',
    'EUR': 'en-DE',
    'GBP': 'en-GB',
    'KES': 'en-KE',
    'CHF': 'de-CH'
  };
  
  const locale = localeMap[currencyCode] || 'en-US';
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits 
  }).format(amount);
};

export const getCurrencySymbol = (currencyCode) => {
  return formatCurrency(0, currencyCode).replace(/[\d.,\s]/g, '');
};
