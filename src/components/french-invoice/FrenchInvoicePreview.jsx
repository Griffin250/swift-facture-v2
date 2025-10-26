import { useTranslation } from 'react-i18next';
import { formatFrenchDate, formatFrenchNumber } from '../../utils/frenchInvoiceCalculations';

/**
 * @param {Object} props
 * @param {Object} props.invoiceData
 * @param {Object} props.totals
 * @param {boolean} props.showCustomerTitle
 */
const FrenchInvoicePreview = ({ invoiceData, totals, showCustomerTitle }) => {
  const { t } = useTranslation();
  const { 
    company = {}, 
    client = {}, 
    invoice = {}, 
    items = [], 
    payment = {}, 
    footer = {}
  } = invoiceData || {};

  // Generate company initials from company name
  const getCompanyInitials = (companyName) => {
    if (!companyName || companyName.trim() === '') {
      return 'SF'; // Fallback to SwiftFacture
    }
    
    const words = companyName.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word - take first two letters
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple words - take first letter of first two words
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  };

  return (
    <div className="french-invoice">
      <div className="invoice-content">
        {/* Header Section */}
      <div className="invoice-header">
        {/* Company Logo */}
        <div className="logo-section">
          {company?.logo && company.logo !== '' && company.logo !== null ? (
            <img 
              src={company.logo} 
              alt={`${company?.name || 'SwiftFacture'} Logo`}
              className="company-logo"
            />
          ) : (
            <div className="logo-placeholder">
              <div className="flex items-center gap-2">
                {/* Company initials when logo is disabled */}
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <div className="text-white font-bold text-lg">{getCompanyInitials(company?.name)}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-800">{company?.name || 'SWIFTFACTURE'}</div>
                  <div className="text-xs text-blue-600">FACTURATION RAPIDE</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Title and Info */}
        <div className="invoice-title">
          <h1 className="invoice-number">{t('frenchInvoice.invoice.invoiceTitle')} - {invoice?.number || 'N/A'}</h1>
          <div className="invoice-meta">
            <div>{t('frenchInvoice.invoice.date')}: {formatFrenchDate(invoice?.date)}</div>
            <div>{t('frenchInvoice.invoice.dueDate')}: {formatFrenchDate(invoice?.dueDate)}</div>
            <div>{t('frenchInvoice.invoice.operationType')}: {invoice?.operationType || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Company Information Section */}
      <div className="company-info">
        {/* Sender Information */}
        <div className="company-block">
          <h3>{company?.name || t('frenchInvoice.company.name')}</h3>
          <div className="company-details">
            <div>{company?.address || ''}</div>
            <div>{company?.city || ''}</div>
            <div>{company?.phone || ''}</div>
            <div>{company?.email || ''}</div>
            {company?.website && <div>{company.website}</div>}
          </div>
        </div>

        {/* Client Information */}
        <div className="company-block">
          {showCustomerTitle && (
            <h3>{t('frenchInvoice.client.clientLabel')}</h3>
          )}
          <div className="company-name">{client?.name || t('frenchInvoice.client.name')}</div>
          <div className="company-details">
            <div>{client?.address || ''}</div>
            {client?.postalCode && <div>{client.postalCode}</div>}
            <div>{client?.city || ''}</div>
            {client?.phone && <div>{client.phone}</div>}
            {client?.country && client.country !== 'France' && <div>{client.country}</div>}
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="table-section">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>{t('frenchInvoice.items.description')}</th>
              <th className="text-center">{t('frenchInvoice.items.date')}</th>
              <th className="text-center">{t('frenchInvoice.items.qty')}</th>
              <th className="text-center">{t('frenchInvoice.items.unit')}</th>
              <th className="text-right">{t('frenchInvoice.items.unitPrice')}</th>
              <th className="text-center">{t('frenchInvoice.items.vatRate')}</th>
              <th className="text-right">{t('frenchInvoice.items.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item, index) => (
              <tr key={item?.id || index}>
                <td>{item?.description || ''}</td>
                <td className="text-center">{formatFrenchDate(item?.date || invoice?.date)}</td>
                <td className="text-center">{formatFrenchNumber(item?.quantity || 0)}</td>
                <td className="text-center">{item?.unit || t('frenchInvoice.placeholders.unit')}</td>
                <td className="text-right">{formatFrenchNumber(item?.unitPrice || 0)} €</td>
                <td className="text-center">{formatFrenchNumber(item?.vatRate || 0)} %</td>
                <td className="text-right">{formatFrenchNumber((item?.quantity || 0) * (item?.unitPrice || 0))} €</td>
              </tr>
            )) || []}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="totals-section">
        <table className="totals-table">
          <tbody>
            <tr>
              <td className="label">{t('frenchInvoice.totals.subtotalHT')}</td>
              <td className="amount">{formatFrenchNumber(totals?.subtotal || 0)} €</td>
            </tr>
            <tr>
              <td className="label">{t('frenchInvoice.totals.vatAmount')}</td>
              <td className="amount">{formatFrenchNumber(totals?.vatAmount || 0)} €</td>
            </tr>
            <tr className="total-row">
              <td className="label total text-white">{t('frenchInvoice.totals.totalTTC')}</td>
              <td className="amount total-amount totalAmount">{formatFrenchNumber(totals?.total || 0)} €</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Information */}
      {payment?.showPaymentInfo !== false && (payment?.bank || payment?.iban || payment?.bic) && (
        <div className="payment-info">
          <h3>{t('frenchInvoice.payment.methods')}</h3>
          <div className="payment-details">
            {payment?.bank && (
              <div className="payment-line">{t('frenchInvoice.payment.bank')}: {payment.bank}</div>
            )}
            {payment?.iban && (
              <div className="payment-line iban-display">{t('frenchInvoice.payment.iban')}: {payment.iban}</div>
            )}
            {payment?.bic && (
              <div className="payment-line">{t('frenchInvoice.payment.bic')}: {payment.bic}</div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Footer */}
      {footer?.showFooter !== false && (
        <div className="invoice-footer">
          <div className="text-bold">
            {footer?.companyName || company?.name || t('frenchInvoice.company.name')}
          </div>
          <div>
            {footer?.address || `${company?.address || ''} ${company?.city || ''}`.trim() || ''}
          </div>
          {footer?.customMessage && (
            <div className="footer-message">
              {footer.customMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FrenchInvoicePreview;