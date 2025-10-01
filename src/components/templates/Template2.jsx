
import { useTranslation } from 'react-i18next';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';

const Template2 = ({ data }) => {
  const { t } = useTranslation();
  const { billTo, shipTo, invoice, yourCompany, items, taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency } = data;

  return (
    <BaseTemplate data={data}>
      <div className="bg-white p-8 max-w-4xl mx-auto">
        <div className="flex justify-between mb-4 border-b-2 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-cyan-700">
              {yourCompany.name}
            </h1>
            <p>{yourCompany.address}</p>
            <p>{yourCompany.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-cyan-700">{t('invoiceTemplate.invoice')}</h2>
            <p>{t('invoiceTemplate.invoiceNumber').toUpperCase()}: {invoice.number}</p>
            <p>{t('invoiceTemplate.invoiceDate').toUpperCase()}: {invoice.date}</p>
            <p>{t('invoiceTemplate.dueDate').toUpperCase()}: {invoice.paymentDate}</p>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-cyan-700">{t('invoiceTemplate.billTo')}</h3>
            <p>{billTo.name}</p>
            <p>{billTo.address}</p>
            <p>{billTo.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-cyan-700">{t('invoiceTemplate.shipTo')}</h3>
            <p>{shipTo.name}</p>
            <p>{shipTo.address}</p>
            <p>{shipTo.phone}</p>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full border border-gray-300">
            <thead>
              <tr>
                <th className="p-2 text-left border border-gray-300">ID</th>
                <th className="p-2 text-left border border-gray-300">
                  {t('invoiceTemplate.description')}
                </th>
                <th className="p-2 text-right border border-gray-300">
                  {t('invoiceTemplate.quantity')}
                </th>
                <th className="p-2 text-right border border-gray-300">{t('invoiceTemplate.rate')}</th>
                <th className="p-2 text-right border border-gray-300">
                  {t('invoiceTemplate.amount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="p-2 border border-gray-300">{index + 1}</td>
                  <td className="p-2 border border-gray-300">
                    {item.name}
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {item.quantity}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCurrency(item.amount, selectedCurrency)}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCurrency(item.total, selectedCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

        {notes && (
          <div className="mt-8 text-sm">
            <h3 className="font-semibold mb-2">{t('invoiceTemplate.notes')}:</h3>
            <p>{notes}</p>
          </div>
        )}
      </div>
    </BaseTemplate>
  );
};

export default Template2;
