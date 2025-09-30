// React import not required with new JSX transform
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import BaseTemplate2 from './BaseTemplate2';
import { calculateSubTotal, calculateTaxAmount, calculateGrandTotal } from '../../utils/invoiceCalculations';
import { formatCurrency } from '../../utils/formatCurrency';

const Receipt2 = ({ data, isPrint = false }) => {
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
        className="bg-white flex flex-col min-h-full text-slate-800"
        style={{
          fontSize: isPrint ? "8px" : "14px",
          fontFamily: isPrint
            ? "'Courier New', monospace"
            : "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          whiteSpace: "pre-wrap",
          lineHeight: "1.25",
        }}
      >
        <div className="flex-grow px-2">
          <header className="mb-3 text-center">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-600">{yourCompany.name || t('receiptTemplate.na')}</div>
            <div className="text-2xl font-extrabold mt-1">{t('receiptTemplate.receipt')}</div>
            <div className="text-xs text-slate-400 mt-1">{yourCompany.address || ''}</div>
            {yourCompany.phone && <div className="text-xs text-slate-400">{yourCompany.phone}</div>}
          </header>

          <section className="mb-3 flex justify-between text-sm text-slate-600">
            <div>{t('receiptTemplate.invoiceNumber')}: <span className="font-medium text-slate-800">{invoice.number || t('receiptTemplate.na')}</span></div>
            <div>{t('receiptTemplate.date')}: <span className="font-medium text-slate-800">{invoice.date ? format(new Date(invoice.date), 'MM/dd/yyyy') : t('receiptTemplate.na')}</span></div>
          </section>

          <section className="mb-3">
            <div className="text-sm text-slate-600 mb-1">{t('receiptTemplate.customer')}</div>
            <div className="font-medium text-slate-800">{billTo || t('receiptTemplate.na')}</div>
          </section>

          <section className="mb-3">
            <div className="text-sm text-slate-600 mb-1">{t('receiptTemplate.cashier')}</div>
            <div className="font-medium text-slate-800">{cashier || t('receiptTemplate.na')}</div>
          </section>

          <section className="border-t border-slate-200 pt-3">
            <div className="flex justify-between font-semibold text-sm mb-2">
              <div className="w-2/3">{t('receiptTemplate.item')}</div>
              <div className="w-1/3 text-right">{t('receiptTemplate.total')}</div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-1 border-b last:border-b-0 border-slate-100">
                <div className="w-2/3">
                  <div className="font-medium text-slate-800">{item.name || t('receiptTemplate.na')} <span className="text-xs text-slate-500">x{item.quantity || 0}</span></div>
                  {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                </div>
                <div className="w-1/3 text-right font-medium">{formatCurrency((item.quantity || 0) * (item.amount || 0), selectedCurrency)}</div>
              </div>
            ))}
          </section>

          <footer className="mt-3 text-sm">
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
              <div className="text-lg font-semibold">{t('receiptTemplate.grandTotal')}</div>
              <div className="text-lg font-extrabold">{formatCurrency(total, selectedCurrency)}</div>
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

export default Receipt2;
