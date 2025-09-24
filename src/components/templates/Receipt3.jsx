// React import not required with new JSX transform
import { format } from 'date-fns';
import BaseTemplate2 from './BaseTemplate2';
import { calculateSubTotal, calculateTaxAmount, calculateGrandTotal } from '../../utils/invoiceCalculations';
import { formatCurrency } from '../../utils/formatCurrency';

const Receipt3 = ({ data, isPrint = false }) => {
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
        className="bg-white flex flex-col min-h-full text-slate-800 border border-dashed border-slate-400 rounded-xl shadow-md"
        style={{
          fontSize: isPrint ? "8px" : "14px",
          fontFamily: isPrint
            ? "'Monaco', monospace"
            : "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          whiteSpace: "pre-wrap",
          lineHeight: "1.25",
        }}
      >
        <div className="flex-grow px-2">
          <header className="mb-3 text-center border-b-2 border-dashed pb-2">
            <div className="text-xl font-extrabold tracking-widest text-slate-700">CASH RECEIPT</div>
            {yourCompany.name && <div className="text-base font-semibold mt-1">{yourCompany.name}</div>}
            {yourCompany.address && <div className="text-xs text-slate-400">{yourCompany.address}</div>}
            {yourCompany.phone && <div className="text-xs text-slate-400">{yourCompany.phone}</div>}
          </header>

          <section className="mb-2 flex justify-between text-xs text-slate-600">
            <div>Invoice#: <span className="font-medium text-slate-800">{invoice.number || 'N/A'}</span></div>
            <div>Date: <span className="font-medium text-slate-800">{invoice.date ? format(new Date(invoice.date), 'MM/dd/yyyy') : 'N/A'}</span></div>
          </section>

          <section className="mb-2 flex justify-between text-xs">
            <div className="text-slate-600">Customer</div>
            <div className="font-medium text-slate-800">{billTo || 'N/A'}</div>
          </section>

          <section className="mb-2 flex justify-between text-xs">
            <div className="text-slate-600">Cashier</div>
            <div className="font-medium text-slate-800">{cashier || 'N/A'}</div>
          </section>

          <section className="py-2 mb-2">
            <div className="grid grid-cols-4 font-bold text-xs mb-2">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-center">Amt</span>
              <span className="text-right">Total</span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-4 items-center mb-1 text-xs">
                <span className="truncate">{`${index + 1}. ${item.name || 'N/A'}`}</span>
                <span className="text-center">{item.quantity || 0}</span>
                <span className="text-center">{formatCurrency(item.amount || 0, selectedCurrency)}</span>
                <span className="text-right">{formatCurrency((item.quantity || 0) * (item.amount || 0), selectedCurrency)}</span>
              </div>
            ))}
          </section>

          <footer className="mt-2 text-xs">
            <div className="flex justify-between py-1">
              <div className="text-slate-600">SubTotal</div>
              <div className="font-medium">{formatCurrency(subTotal, selectedCurrency)}</div>
            </div>
            {taxPercentage > 0 && (
              <div className="flex justify-between py-1">
                <div className="text-slate-600">Tax ({taxPercentage}%)</div>
                <div className="font-medium">{formatCurrency(taxAmount, selectedCurrency)}</div>
              </div>
            )}
            <div className="flex justify-between py-2 border-t border-dashed border-slate-400 mt-2">
              <div className="text-base font-semibold">{`${items.length} Items`}</div>
              <div className="text-base font-extrabold">{formatCurrency(total, selectedCurrency)}</div>
            </div>

            {notes && (
              <div className="mt-3 text-xs text-slate-600">
                <div className="font-semibold text-slate-700">Notes</div>
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

export default Receipt3;
