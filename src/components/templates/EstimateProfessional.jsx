import React from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatCurrency';

const EstimateProfessional = ({ estimate, isPrint = false }) => {
  const {
    company = {},
    customer = {},
    number = '',
    date = '',
    validUntil = '',
    currency = 'USD',
    taxRate = 0,
    discount = 0,
    notes = '',
    items = [],
    status = '',
  } = estimate || {};

  const subTotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  const discountAmount = Math.min(Math.max(discount, 0), 100) * 0.01 * subTotal;
  const taxable = Math.max(subTotal - discountAmount, 0);
  const taxAmount = Math.max(taxRate, 0) * 0.01 * taxable;
  const total = taxable + taxAmount;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-3xl mx-auto font-sans">
      <header className="mb-6 text-center">
        <div className="text-3xl font-bold text-blue-700 tracking-wide">ESTIMATE</div>
        <div className="text-lg font-semibold mt-2 text-gray-800">{company.name || 'Your Company'}</div>
        <div className="text-sm text-gray-500">{company.address || ''}</div>
        {company.phone && <div className="text-sm text-gray-500">{company.phone}</div>}
      </header>

      <section className="mb-4 grid grid-cols-2 gap-8">
        <div>
          <div className="text-xs text-gray-500 mb-1">Prepared For</div>
          <div className="font-medium text-gray-800">{customer.name || 'Customer Name'}</div>
          <div className="text-sm text-gray-500">{customer.address || ''}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Estimate Details</div>
          <div className="text-sm text-gray-700">No: <span className="font-semibold">{number}</span></div>
          <div className="text-sm text-gray-700">Date: <span className="font-semibold">{date ? format(new Date(date), 'MM/dd/yyyy') : ''}</span></div>
          <div className="text-sm text-gray-700">Valid Until: <span className="font-semibold">{validUntil ? format(new Date(validUntil), 'MM/dd/yyyy') : ''}</span></div>
          <div className="text-sm text-gray-700">Currency: <span className="font-semibold">{currency}</span></div>
        </div>
      </section>

      <section className="mb-6">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-gray-700 font-semibold">Description</th>
              <th className="p-3 text-center text-gray-700 font-semibold">Qty</th>
              <th className="p-3 text-right text-gray-700 font-semibold">Unit Price</th>
              <th className="p-3 text-right text-gray-700 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 text-gray-800">{item.description}</td>
                <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                <td className="p-3 text-right text-gray-600">{formatCurrency(item.price, currency)}</td>
                <td className="p-3 text-right font-semibold text-gray-900">{formatCurrency(item.quantity * item.price, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-6 max-w-md ml-auto">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">{formatCurrency(subTotal, currency)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Discount ({discount}%):</span>
            <span className="font-semibold text-red-600">-{formatCurrency(discountAmount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Tax ({taxRate}%):</span>
          <span className="font-semibold">{formatCurrency(taxAmount, currency)}</span>
        </div>
        <div className="flex justify-between py-3 border-t border-gray-300 mt-2">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-lg font-bold text-blue-700">{formatCurrency(total, currency)}</span>
        </div>
      </section>

      {notes && (
        <section className="mb-6">
          <div className="font-semibold text-gray-700 mb-2">Notes</div>
          <div className="text-gray-600">{notes}</div>
        </section>
      )}

      <footer className="text-center text-xs text-gray-400 mt-8">
        This is an estimate, not a binding invoice. Thank you for considering our services.
      </footer>
    </div>
  );
};

export default EstimateProfessional;
