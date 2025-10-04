import { useRef, useState } from 'react';
import { Download, Eye, EyeOff, Mail, Printer, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const FrenchInvoiceTemplate = ({
  // Invoice data
  invoiceData = {
    number: 'FACT-2024-001',
    date: '2024-10-04',
    dueDate: '2024-11-04',
    operationType: 'Vente de marchandises',
    orderNumber: 'CMD-2024-001',
    sender: {
      name: 'Mon Entreprise SARL',
      address: '123 Rue de la République',
      postalCode: '75001',
      city: 'Paris',
      phone: '+33 1 23 45 67 89',
      email: 'contact@monentreprise.fr',
      siret: '12345678901234',
      tva: 'FR12345678901'
    },
    receiver: {
      name: 'Client SARL',
      address: '456 Avenue des Champs',
      postalCode: '69000',
      city: 'Lyon',
      phone: '+33 4 12 34 56 78',
      email: 'contact@client.fr'
    },
    items: [
      {
        description: 'Prestation de conseil',
        date: '2024-10-01',
        quantity: 5,
        unit: 'heure',
        unitPrice: 80.00,
        vatRate: 20,
        amount: 400.00
      },
      {
        description: 'Formation personnalisée',
        date: '2024-10-02',
        quantity: 1,
        unit: 'journée',
        unitPrice: 600.00,
        vatRate: 20,
        amount: 600.00
      }
    ],
    payment: {
      bank: 'Banque Populaire',
      iban: 'FR76 1234 5678 9012 3456 789',
      bic: 'CCBPFRPPXXX'
    },
    notes: 'Merci de votre confiance. Paiement à réception de facture.',
    terms: 'Conditions générales de vente disponibles sur notre site web.'
  },
  
  // Visibility controls
  showInvoiceNumber = true,
  showDueDate = true,
  showOperationType = true,
  showOrderNumber = true,
  showSenderInfo = true,
  showReceiverInfo = true,
  showTotals = true,
  showPaymentInfo = true,
  showFooter = true,
  showNotes = true,
  showTerms = true,
  
  // Table column visibility
  hideColumns = [], // Array of column names to hide: ['Date', 'Unit', 'VAT', 'Qty']
  
  // Currency
  currency = '€',
  
  // Styling options
  className = '',
  
  // PDF export options
  enablePdfExport = true
}) => {
  const { t } = useTranslation();
  const invoiceRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Format currency based on current language
  const formatCurrency = (amount) => {
    const currentLocale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currency === '€' ? 'EUR' : 'USD'
    }).format(amount);
  };

  // Format date based on current language
  const formatDate = (dateString) => {
    const currentLocale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(dateString).toLocaleDateString(currentLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const totalVAT = invoiceData.items.reduce((sum, item) => 
      sum + (item.amount * (item.vatRate / 100)), 0
    );
    const totalTTC = subtotal + totalVAT;
    
    return { subtotal, totalVAT, totalTTC };
  };

  // Check if column should be visible
  const isColumnVisible = (columnName) => {
    return !hideColumns.includes(columnName);
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!invoiceRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`facture-${invoiceData.number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Email function
  const sendEmail = () => {
    const subject = `Invoice ${invoiceData.number}`;
    const body = `Please find attached the invoice ${invoiceData.number} dated ${formatDate(invoiceData.date)}.`;
    const mailtoLink = `mailto:${invoiceData.receiver.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Print function
  const printInvoice = () => {
    window.print();
  };

  // Save function
  const saveInvoice = () => {
    const invoiceDataToSave = {
      ...invoiceData,
      config: {
        showInvoiceNumber,
        showDueDate,
        showOperationType,
        showOrderNumber,
        showSenderInfo,
        showReceiverInfo,
        showTotals,
        showPaymentInfo,
        showFooter,
        showNotes,
        showTerms,
        hideColumns,
        currency
      },
      savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const savedInvoices = JSON.parse(localStorage.getItem('savedInvoices') || '[]');
    const invoiceIndex = savedInvoices.findIndex(inv => inv.number === invoiceData.number);
    
    if (invoiceIndex !== -1) {
      savedInvoices[invoiceIndex] = invoiceDataToSave;
    } else {
      savedInvoices.push(invoiceDataToSave);
    }
    
    localStorage.setItem('savedInvoices', JSON.stringify(savedInvoices));
    
    // Show confirmation (temporary visual feedback)
    const saveButton = document.querySelector('.save-invoice-btn');
    if (saveButton) {
      const originalText = saveButton.textContent;
      saveButton.textContent = t('invoiceTemplate.saved');
      saveButton.style.backgroundColor = '#10b981';
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.backgroundColor = '';
      }, 2000);
    }
  };

  const { subtotal, totalVAT, totalTTC } = calculateTotals();

  return (
    <div className={`max-w-4xl mx-auto bg-white ${className}`}>
      {/* Control Panel */}
      {enablePdfExport && (
        <div className="mb-6 flex justify-between items-center p-4 bg-gray-50 rounded-lg print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
              {previewMode ? t('invoiceTemplate.editMode') : t('invoiceTemplate.preview')}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={sendEmail}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Mail size={16} />
              {t('invoiceTemplate.sendEmail')}
            </button>
            <button
              onClick={printInvoice}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <Printer size={16} />
              {t('invoiceTemplate.print')}
            </button>
            <button
              onClick={saveInvoice}
              className="save-invoice-btn flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              {t('invoiceTemplate.saveInvoice')}
            </button>
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download size={16} />
              {isExporting ? t('invoiceTemplate.generating') : t('invoiceTemplate.downloadPdf')}
            </button>
          </div>
        </div>
      )}

      {/* Invoice Template */}
      <div
        ref={invoiceRef}
        className="bg-white border border-gray-200 shadow-sm"
        style={{ minHeight: '297mm' }}
      >
        {/* Header Section */}
        <div className="border-b border-gray-200 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('invoiceTemplate.invoice')}</h1>
              {showInvoiceNumber && (
                <p className="text-lg text-gray-600">N° {invoiceData.number}</p>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{t('invoiceTemplate.invoiceDate')}:</span> {formatDate(invoiceData.date)}
                </p>
                {showDueDate && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('invoiceTemplate.dueDate')}:</span> {formatDate(invoiceData.dueDate)}
                  </p>
                )}
                {showOperationType && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('invoiceTemplate.operationType')}:</span> {invoiceData.operationType || t('invoiceTemplate.defaultOperationType')}
                  </p>
                )}
                {showOrderNumber && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('invoiceTemplate.orderNumber')}:</span> {invoiceData.orderNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sender and Receiver Section */}
        <div className="border-b border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sender Info */}
            {showSenderInfo && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('invoiceTemplate.sender')}
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-semibold text-gray-900">{invoiceData.sender.name}</p>
                  <p className="text-gray-700">{invoiceData.sender.address}</p>
                  <p className="text-gray-700">
                    {invoiceData.sender.postalCode} {invoiceData.sender.city}
                  </p>
                  <p className="text-gray-700 mt-2">
                    {t('invoiceTemplate.phone')}: {invoiceData.sender.phone}
                  </p>
                  <p className="text-gray-700">
                    {t('invoiceTemplate.email')}: {invoiceData.sender.email}
                  </p>
                  {invoiceData.sender.siret && (
                    <p className="text-gray-600 text-sm mt-2">
                      {t('invoiceTemplate.siret')}: {invoiceData.sender.siret}
                    </p>
                  )}
                  {invoiceData.sender.tva && (
                    <p className="text-gray-600 text-sm">
                      {t('invoiceTemplate.tva')}: {invoiceData.sender.tva}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Receiver Info */}
            {showReceiverInfo && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('invoiceTemplate.receiver')}
                </h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="font-semibold text-gray-900">{invoiceData.receiver.name}</p>
                  <p className="text-gray-700">{invoiceData.receiver.address}</p>
                  <p className="text-gray-700">
                    {invoiceData.receiver.postalCode} {invoiceData.receiver.city}
                  </p>
                  <p className="text-gray-700 mt-2">
                    {t('invoiceTemplate.phone')}: {invoiceData.receiver.phone}
                  </p>
                  <p className="text-gray-700">
                    {t('invoiceTemplate.email')}: {invoiceData.receiver.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des prestations</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('invoiceTemplate.description')}
                  </th>
                  {isColumnVisible('Date') && (
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      {t('invoiceTemplate.invoiceDate')}
                    </th>
                  )}
                  {isColumnVisible('Qty') && (
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {t('invoiceTemplate.qty')}
                    </th>
                  )}
                  {isColumnVisible('Unit') && (
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {t('invoiceTemplate.unit')}
                    </th>
                  )}
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {t('invoiceTemplate.unitPrice')}
                  </th>
                  {isColumnVisible('VAT') && (
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {t('invoiceTemplate.vatRate')}
                    </th>
                  )}
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {t('invoiceTemplate.amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    {isColumnVisible('Date') && (
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                        {formatDate(item.date)}
                      </td>
                    )}
                    {isColumnVisible('Qty') && (
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                        {item.quantity}
                      </td>
                    )}
                    {isColumnVisible('Unit') && (
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                        {item.unit}
                      </td>
                    )}
                    <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    {isColumnVisible('VAT') && (
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                        {item.vatRate}%
                      </td>
                    )}
                    <td className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        {showTotals && (
          <div className="border-t border-gray-200 p-8">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{t('invoiceTemplate.subtotal')}:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{t('invoiceTemplate.totalVat')}:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(totalVAT)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">{t('invoiceTemplate.totalAmount')}:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(totalTTC)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {showPaymentInfo && (
          <div className="border-t border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de paiement</h3>
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Banque:</p>
                  <p className="text-sm text-gray-900">{invoiceData.payment.bank}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">IBAN:</p>
                  <p className="text-sm text-gray-900 font-mono">{invoiceData.payment.iban}</p>
                </div>
                {invoiceData.payment.bic && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">BIC:</p>
                    <p className="text-sm text-gray-900">{invoiceData.payment.bic}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Section */}
        {showFooter && (showNotes || showTerms) && (
          <div className="border-t border-gray-200 p-8 bg-gray-50">
            <div className="space-y-4">
              {showNotes && invoiceData.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h4>
                  <p className="text-sm text-gray-600">{invoiceData.notes}</p>
                </div>
              )}
              {showTerms && invoiceData.terms && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Conditions:</h4>
                  <p className="text-sm text-gray-600">{invoiceData.terms}</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-300 text-center">
              <p className="text-xs text-gray-500">
                Facture générée le {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrenchInvoiceTemplate;