
import { useTranslation } from 'react-i18next';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';

const Template1 = ({ data }) => {
  const { t } = useTranslation();
  const { billTo, shipTo, invoice, yourCompany, items, taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency } = data;

  return (
    <BaseTemplate data={data}>
      <div className="bg-white p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-right">
            <h2 className="text-3xl font-semibold">{t('invoiceTemplate.invoice')}</h2>
          </div>
        </div>

        <div className="flex justify-between mb-12">
          <div>
            <h1 className="text-2xl font-bold">{yourCompany.name}</h1>
            <p>{yourCompany.address}</p>
            <p>{yourCompany.phone}</p>
          </div>
          <div>
            <p>{t('invoiceTemplate.invoiceNumber')}: {invoice.number}</p>
            <p>{t('invoiceTemplate.invoiceDate')}: {invoice.date}</p>
            <p>{t('invoiceTemplate.dueDate')}: {invoice.paymentDate}</p>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="font-semibold">{t('invoiceTemplate.billTo')}:</h3>
            <p>{billTo.name}</p>
            <p>{billTo.address}</p>
            <p>{billTo.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t('invoiceTemplate.shipTo')}:</h3>
            <p>{shipTo.name}</p>
            <p>{shipTo.address}</p>
            <p>{shipTo.phone}</p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-t border-b bg-gray-100">
              <th className="p-2 text-left">{t('invoiceTemplate.item')}</th>
              <th className="p-2 text-center">{t('invoiceTemplate.quantity')}</th>
              <th className="p-2 text-right">{t('invoiceTemplate.unitPrice')}</th>
              <th className="p-2 text-right">{t('invoiceTemplate.total')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t-2 border-b-2 border-gray-800">
                <td className="p-2">
                  {item.name}
                  <div className="text-sm text-gray-500">
                    {item.description}
                  </div>
                </td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">
                  {formatCurrency(item.amount, selectedCurrency)}
                </td>
                <td className="p-2 text-right">
                  {formatCurrency(item.total, selectedCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/3">
            <div className="flex justify-between mb-2">
              <span>{t('invoiceTemplate.subtotal')}:</span>
              <span>{formatCurrency(subTotal, selectedCurrency)}</span>
            </div>
            {taxPercentage > 0 && (
              <div className="flex justify-between mb-2">
                <span>{t('invoiceTemplate.tax')} ({taxPercentage}%):</span>
                <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>{t('invoiceTemplate.total')}:</span>
              <span>{formatCurrency(grandTotal, selectedCurrency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-2">{t('invoiceTemplate.notes')}:</h3>
          <p>{notes}</p>
        </div>
      </div>
    </BaseTemplate>
  );
};

export default Template1;
