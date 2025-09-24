export const calculateSubTotal = (items = []) => {
  const raw = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const amt = parseFloat(item.amount) || 0;
    return sum + qty * amt;
  }, 0);
  // return a number rounded to 2 decimals
  return Math.round(raw * 100) / 100;
};

export const calculateTaxAmount = (subTotal = 0, taxPercentage = 0) => {
  const st = parseFloat(subTotal) || 0;
  const tax = (st * (parseFloat(taxPercentage) || 0)) / 100;
  return Math.round(tax * 100) / 100;
};

// Accepts subtotal and tax amount (preferred). Returns numeric grand total.
export const calculateGrandTotal = (subTotal = 0, taxAmount = 0) => {
  const st = parseFloat(subTotal) || 0;
  const ta = parseFloat(taxAmount) || 0;
  return Math.round((st + ta) * 100) / 100;
};

export const generateGSTNumber = () => {
  var stateCode = 22;
  var panNumber = generatePANNumber();
  var registrationCount = generateRegistrationCount();
  var checkCode = generateCheckCode();
  return stateCode + panNumber + registrationCount + "Z" + checkCode;
};

function generatePANNumber() {
  var panNumber = "";
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var taxpayerCategories = "ABCFGHLJPT";
  for (var i = 0; i < 3; i++) {
    panNumber += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  panNumber += taxpayerCategories.charAt(
    Math.floor(Math.random() * taxpayerCategories.length)
  );
  panNumber += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  for (var j = 0; j < 4; j++) {
    panNumber += Math.floor(Math.random() * 10);
  }
  panNumber += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return panNumber;
}

function generateRegistrationCount() {
  var registrationCount = Math.floor(Math.random() * 10);
  return registrationCount;
}

function generateCheckCode() {
  var checkCode = Math.floor(Math.random() * 10);
  return checkCode;
}
