// React import not required with new JSX transform
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import BaseTemplate2 from './BaseTemplate2';
import { calculateSubTotal, calculateTaxAmount, calculateGrandTotal } from '../../utils/invoiceCalculations';
import { formatCurrency } from '../../utils/formatCurrency';

const Receipt1 = ({ data, isPrint = false }) => {
  const { t } = useTranslation();
  const { billTo = {}, invoice = {}, yourCompany = {}, cashier = '', items = [], taxPercentage = 0, notes = '', footer = '', selectedCurrency } = data || {};

  const subTotal = calculateSubTotal(items);
  const taxAmount = calculateTaxAmount(subTotal, taxPercentage);
  const total = calculateGrandTotal(subTotal, taxAmount);

  return (
    <BaseTemplate2
      width="80mm"
      height="auto"
      className="p-2"
      data={data}
      isPrint={isPrint}
    >
      <div
        className="bg-white flex flex-col min-h-full text-slate-800 border border-slate-200 rounded-xl shadow-md"
        style={{
          fontSize: isPrint ? "8px" : "14px",
          fontFamily: isPrint
            ? "'Courier New', Courier, monospace"
            : "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          whiteSpace: "pre-wrap",
          lineHeight: "1.25",
        }}
      >
        <div className="flex-grow px-2">
          <header className="mb-3 text-center">
            <div className="text-2xl font-extrabold tracking-widest text-slate-700">{t('receiptTemplate.receipt')}</div>
            <div className="text-base font-semibold mt-1">{yourCompany.name || 'N/A'}</div>
            <div className="text-xs text-slate-400 mt-1">{yourCompany.address || ''}</div>
            {yourCompany.phone && <div className="text-xs text-slate-400">{yourCompany.phone}</div>}
          </header>

          <section className="mb-2 flex justify-between text-xs text-slate-600">
            <div>{t('receiptTemplate.invoiceNumber')}: <span className="font-medium text-slate-800">{invoice.number || t('receiptTemplate.na')}</span></div>
            <div>{t('receiptTemplate.date')}: <span className="font-medium text-slate-800">{invoice.date ? format(new Date(invoice.date), 'MM/dd/yyyy') : t('receiptTemplate.na')}</span></div>
          </section>

          <section className="mb-2">
            <div className="text-xs text-slate-600 mb-1">{t('receiptTemplate.customer')}</div>
            <div className="font-medium text-slate-800">{billTo || t('receiptTemplate.na')}</div>
          </section>

          <section className="mb-2">
            <div className="text-xs text-slate-600 mb-1">{t('receiptTemplate.cashier')}</div>
            <div className="font-medium text-slate-800">{cashier || t('receiptTemplate.na')}</div>
          </section>

          <section className="border-t border-b border-slate-200 py-2 mb-2">
            <div className="flex justify-between font-bold text-xs mb-2">
              <span>{t('receiptTemplate.item')}</span>
              <span>{t('receiptTemplate.qty')}</span>
              <span>{t('receiptTemplate.total')}</span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-1 text-xs">
                <span className="w-1/2 truncate">{item.name || t('receiptTemplate.na')}</span>
                <span className="w-1/4 text-center">{item.quantity || 0}</span>
                <span className="w-1/4 text-right">{formatCurrency((item.quantity || 0) * (item.amount || 0), selectedCurrency)}</span>
              </div>
            ))}
          </section>

          <footer className="mt-2 text-xs">
            <div className="flex justify-between py-1">
              <div className="text-slate-600">{t('receiptTemplate.subtotal')}</div>
              <div className="font-medium">{formatCurrency(subTotal, selectedCurrency)}</div>
            </div>
            {taxPercentage > 0 && (
              <div className="flex justify-between py-1">
                <div className="text-slate-600">{t('receiptTemplate.tax')} ({taxPercentage}%)</div>
                <div className="font-medium">{formatCurrency(taxAmount, selectedCurrency)}</div>
              </div>
            )}
            <div className="flex justify-between py-2 border-t border-slate-200 mt-2">
              <div className="text-base font-semibold">{t('receiptTemplate.grandTotal')}</div>
              <div className="text-base font-extrabold">{formatCurrency(total, selectedCurrency)}</div>
            </div>

            {notes && (
              <div className="mt-3 text-xs text-slate-600">
                <div className="font-semibold text-slate-700">{t('receiptTemplate.notes')}</div>
                <div>{notes}</div>
              </div>
            )}
          </footer>
        </div>

        <div className="text-center mt-4 text-xs text-slate-500 p-2">{footer || ''}</div>
      </div>
    </BaseTemplate2>
  );
};

export default Receipt1;
