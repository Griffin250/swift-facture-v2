import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';

const Receipt4 = ({ data }) => {
  const { t } = useTranslation();
  const { billTo, invoice, yourCompany, items, taxPercentage, footer, cashier, selectedCurrency } = data;
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
  <div className="p-4 font-sans bg-white border border-slate-200 rounded-xl shadow-md text-slate-800 text-xs">
      <h2 className="text-center text-xl font-extrabold tracking-widest text-slate-700 mb-1">{yourCompany.name}</h2>
      <p className="text-center text-xs text-slate-400">{yourCompany.address}</p>
      <p className="text-center text-xs text-slate-400">Phone: {yourCompany.phone}</p>
      {yourCompany.gst && (
        <p className="text-center text-xs text-slate-400">GST No: {yourCompany.gst.toUpperCase()}</p>
      )}
      <hr className="my-3 border-slate-200" />
      <div className="flex justify-between text-xs mb-2">
        <span>{t('receiptTemplate.invoiceNumber')} #: <span className="font-medium text-slate-800">{invoice.number}</span></span>
        <span>{t('receiptTemplate.date')} & Time: <span className="font-medium text-slate-800">{invoice.date} {currentTime}</span></span>
      </div>
      <div className="flex justify-between text-xs mb-2">
        <span>{t('receiptTemplate.createdBy')}: <span className="font-medium text-slate-800">{data.cashier}</span></span>
      </div>
      <hr className="my-3 border-slate-200" />
      <div className="mb-2">
        <h3 className="font-semibold text-slate-700 mb-1">{t('receiptTemplate.customer')}:</h3>
        <p className="text-slate-800">{billTo}</p>
        <span className="text-xs text-slate-400">Place of supply: Chhattisgarh-22</span>
      </div>
      <hr className="my-3 border-slate-200" />
  <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left font-semibold">{t('receiptTemplate.item')}</th>
            <th className="text-right font-semibold">{t('receiptTemplate.qty')}</th>
            <th className="text-right font-semibold">{t('receiptTemplate.price')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <tr className="align-bottom border-b border-slate-100">
                <td>{item.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{formatCurrency(item.amount, selectedCurrency)}</td>
              </tr>
              <tr className="align-top">
                <td colSpan="2" className="text-left text-xs pb-2 text-slate-500">
                  HSN Code: {item.description}
                </td>
                <td className="text-right pb-2 text-xs">{t('receiptTemplate.total')}: {formatCurrency(item.total, selectedCurrency)}</td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
  <hr className="my-3 border-slate-200" />
      <div className="flex justify-between">
        <span>{t('receiptTemplate.subtotal')}:</span>
        <span className="font-medium">{formatCurrency(items.reduce((sum, item) => sum + item.total, 0), selectedCurrency)}</span>
      </div>
      <div className="flex justify-between">
        <span>{t('receiptTemplate.tax')} ({taxPercentage}%):</span>
        <span className="font-medium">{formatCurrency(
            items.reduce((sum, item) => sum + item.total, 0) * (taxPercentage / 100),
            selectedCurrency
          )}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>{t('receiptTemplate.grandTotal').toUpperCase()}:</span>
        <span className="text-base font-extrabold">{formatCurrency(
            items.reduce((sum, item) => sum + item.total, 0) * (1 + taxPercentage / 100),
            selectedCurrency
          )}</span>
      </div>
  <hr className="my-3 border-slate-200" />
      <div className="mt-2">
        <h3 className="mb-2 font-semibold text-slate-700">{t('receiptTemplate.taxSummary')}</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left font-normal">{t('receiptTemplate.type')}</th>
              <th className="text-right font-normal">{t('receiptTemplate.rate')}</th>
              <th className="text-right font-normal">{t('receiptTemplate.totalAmt')}</th>
              <th className="text-right font-normal">{t('receiptTemplate.taxAmt')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CGST</td>
              <td className="text-right">{(taxPercentage / 2).toFixed(2)}%</td>
              <td className="text-right">{formatCurrency(items.reduce((sum, item) => sum + item.total, 0), selectedCurrency)}</td>
              <td className="text-right">{formatCurrency(items.reduce((sum, item) => sum + item.total, 0) * (taxPercentage / 200), selectedCurrency)}</td>
            </tr>
            <tr>
              <td>SGST</td>
              <td className="text-right">{(taxPercentage / 2).toFixed(2)}%</td>
              <td className="text-right">{formatCurrency(items.reduce((sum, item) => sum + item.total, 0), selectedCurrency)}</td>
              <td className="text-right">{formatCurrency(items.reduce((sum, item) => sum + item.total, 0) * (taxPercentage / 200), selectedCurrency)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <hr className="my-3 border-slate-200" />
      <p className="text-center text-xs text-slate-500">{footer}</p>
    </div>
  );
};

export default Receipt4;
