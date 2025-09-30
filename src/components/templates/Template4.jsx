
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';

const Template4 = ({ data }) => {
  const { t } = useTranslation();
  const { billTo = {}, shipTo = {}, invoice = {}, yourCompany = {}, items = [], taxPercentage = 0, taxAmount = 0, subTotal = 0, grandTotal = 0, notes = '', selectedCurrency } = data || {};

  return (
    <BaseTemplate data={data}>
      <div className="bg-white p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-4">{t('invoiceTemplate.invoice')}</h1>
            <p>
              <span className="font-semibold">{t('invoiceTemplate.invoiceNumber')}:</span>{" "}
              {invoice.number || t('invoiceTemplate.na')}
            </p>
            <p>
              <span className="font-semibold">{t('invoiceTemplate.invoiceDate')}:</span>{" "}
              {invoice.date
                ? format(new Date(invoice.date), "MMM dd, yyyy")
                : t('invoiceTemplate.na')}
            </p>
            <p>
              <span className="font-semibold">{t('invoiceTemplate.dueDate')}:</span>{" "}
              {invoice.paymentDate
                ? format(new Date(invoice.paymentDate), "MMM dd, yyyy")
                : t('invoiceTemplate.na')}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">
              {yourCompany.name || t('invoiceTemplate.companyName')}
            </h2>
            <p>{yourCompany.address || t('invoiceTemplate.companyAddress')}</p>
            <p>{yourCompany.phone || t('invoiceTemplate.companyPhone')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">
              {t('invoiceTemplate.billedBy')}
            </h3>
            <p>
              <strong>{yourCompany.name || t('invoiceTemplate.companyName')}</strong>
            </p>
            <p>{yourCompany.address || t('invoiceTemplate.companyAddress')}</p>
            <p>{yourCompany.phone || t('invoiceTemplate.companyPhone')}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">
              {t('invoiceTemplate.billedTo')}
            </h3>
            <p>
              <strong>{billTo.name || t('invoiceTemplate.clientName')}</strong>
            </p>
            <p>{billTo.address || t('invoiceTemplate.clientAddress')}</p>
            <p>{billTo.phone || t('invoiceTemplate.clientPhone')}</p>
          </div>
        </div>

        <table className="w-full mb-8 border border-gray-300">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-2 text-left border border-gray-300">
                {t('invoiceTemplate.itemDescription')}
              </th>
              <th className="p-2 text-right border border-gray-300">{t('invoiceTemplate.qty')}</th>
              <th className="p-2 text-right border border-gray-300">{t('invoiceTemplate.rate')}</th>
              <th className="p-2 text-right border border-gray-300">{t('invoiceTemplate.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="bg-gray-100">
                <td className="p-2 border border-gray-300">
                  {`${index + 1}. ${item.name || t('invoiceTemplate.itemName')}`}
                  <br />
                  <span className="text-sm text-gray-600">
                    {item.description || t('invoiceTemplate.itemDescription')}
                  </span>
                </td>
                <td className="p-2 text-right border border-gray-300">
                  {item.quantity || 0}
                </td>
                <td className="p-2 text-right border border-gray-300">
                  {formatCurrency(item.amount || 0, selectedCurrency)}
                </td>
                <td className="p-2 text-right border border-gray-300">
                  {formatCurrency((item.quantity || 0) * (item.amount || 0), selectedCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <p className="flex justify-between">
              <span>{t('invoiceTemplate.subTotal')}:</span> <span>{formatCurrency(subTotal, selectedCurrency)}</span>
            </p>
            {taxPercentage > 0 && (
              <>
                <p className="flex justify-between">
                  <span>{t('invoiceTemplate.tax')}({taxPercentage}%):</span> <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
                </p>
              </>
            )}
            <hr className="my-2" />
            <p className="flex justify-between font-bold text-lg mt-2">
              <span>{t('invoiceTemplate.total')}:</span> <span>{formatCurrency(grandTotal, selectedCurrency)}</span>
            </p>
          </div>
        </div>

        {notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">{t('invoiceTemplate.note')}</h3>
            <p>{notes}</p>
          </div>
        )}
      </div>
    </BaseTemplate>
  );
};

export default Template4;
