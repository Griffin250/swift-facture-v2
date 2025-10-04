import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const Template10 = ({ 
  data,
  showInvoiceNumber = true,
  showDueDate = true,
  showOperationType = false,
  showClientInfo = true,
  showPaymentInfo = true,
  showTotals = true,
  hideColumns = [],
  showFooterNotes = true
}) => {
  const { billTo, shipTo, invoice, yourCompany, items = [], taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency = 'USD' } = data;

  const shouldShowColumn = (columnName) => !hideColumns.includes(columnName);

  return (
    <div className="w-full h-full bg-white p-8 font-sans text-sm">
      {/* Header Section */}
      <div className="mb-6 pb-4 border-b-2 border-gray-300">
        <div className="flex justify-between items-start">
          <div>
            {yourCompany?.name && (
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{yourCompany.name}</h1>
            )}
            {yourCompany?.address && (
              <p className="text-gray-600 text-xs">{yourCompany.address}</p>
            )}
            {yourCompany?.phone && (
              <p className="text-gray-600 text-xs">{yourCompany.phone}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">FACTURE</h2>
            {showInvoiceNumber && invoice?.number && (
              <div className="text-xs">
                <span className="font-semibold">N° : </span>
                <span>{invoice.number}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date & Operation Info */}
      <div className="mb-6 flex justify-between text-xs">
        <div>
          {invoice?.date && (
            <div className="mb-1">
              <span className="font-semibold">Date de facturation : </span>
              <span>{new Date(invoice.date).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
          {showDueDate && invoice?.paymentDate && (
            <div className="mb-1">
              <span className="font-semibold">Date d'échéance : </span>
              <span>{new Date(invoice.paymentDate).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
          {showOperationType && (
            <div className="mb-1">
              <span className="font-semibold">Type d'opération : </span>
              <span>Vente de biens / Prestations de services</span>
            </div>
          )}
        </div>
      </div>

      {/* Client Information */}
      {showClientInfo && (
        <div className="mb-6 grid grid-cols-2 gap-6">
          {/* Sender */}
          <div className="border border-gray-300 p-3 rounded">
            <div className="font-semibold text-xs mb-2 text-gray-700">ÉMETTEUR</div>
            {yourCompany?.name && <div className="font-semibold text-xs">{yourCompany.name}</div>}
            {yourCompany?.address && <div className="text-xs text-gray-600">{yourCompany.address}</div>}
            {yourCompany?.phone && <div className="text-xs text-gray-600">{yourCompany.phone}</div>}
          </div>

          {/* Receiver */}
          <div className="border border-gray-300 p-3 rounded">
            <div className="font-semibold text-xs mb-2 text-gray-700">DESTINATAIRE</div>
            {billTo?.name && <div className="font-semibold text-xs">{billTo.name}</div>}
            {billTo?.address && <div className="text-xs text-gray-600">{billTo.address}</div>}
            {billTo?.phone && <div className="text-xs text-gray-600">{billTo.phone}</div>}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left p-2 font-semibold">Description</th>
              {shouldShowColumn('Date') && <th className="text-center p-2 font-semibold w-20">Date</th>}
              {shouldShowColumn('Qty') && <th className="text-center p-2 font-semibold w-16">Qté</th>}
              {shouldShowColumn('Unit') && <th className="text-center p-2 font-semibold w-16">Unité</th>}
              {shouldShowColumn('UnitPrice') && <th className="text-right p-2 font-semibold w-24">Prix Unit. HT</th>}
              {shouldShowColumn('VAT') && <th className="text-center p-2 font-semibold w-16">TVA</th>}
              <th className="text-right p-2 font-semibold w-24">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-2">
                  <div className="font-medium">{item.name}</div>
                  {item.description && <div className="text-gray-500 text-xs">{item.description}</div>}
                </td>
                {shouldShowColumn('Date') && (
                  <td className="text-center p-2">{invoice?.date ? new Date(invoice.date).toLocaleDateString('fr-FR') : '-'}</td>
                )}
                {shouldShowColumn('Qty') && (
                  <td className="text-center p-2">{item.quantity || 0}</td>
                )}
                {shouldShowColumn('Unit') && (
                  <td className="text-center p-2">u</td>
                )}
                {shouldShowColumn('UnitPrice') && (
                  <td className="text-right p-2">{formatCurrency(item.amount || 0, selectedCurrency)}</td>
                )}
                {shouldShowColumn('VAT') && (
                  <td className="text-center p-2">{taxPercentage || 0}%</td>
                )}
                <td className="text-right p-2 font-medium">
                  {formatCurrency((item.quantity || 0) * (item.amount || 0), selectedCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      {showTotals && (
        <div className="mb-6 flex justify-end">
          <div className="w-64 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-semibold">Total HT :</span>
              <span className="font-semibold">{formatCurrency(subTotal || 0, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span>TVA ({taxPercentage || 0}%) :</span>
              <span>{formatCurrency(taxAmount || 0, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-100 px-2 font-bold text-base">
              <span>Total TTC :</span>
              <span>{formatCurrency(grandTotal || 0, selectedCurrency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Information */}
      {showPaymentInfo && (
        <div className="mb-6 border border-gray-300 p-3 rounded text-xs">
          <div className="font-semibold mb-2 text-gray-700">INFORMATIONS DE PAIEMENT</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-600 mb-1">Banque : <span className="font-medium">Votre Banque</span></div>
              <div className="text-gray-600">IBAN : <span className="font-medium">FR76 XXXX XXXX XXXX XXXX XXXX XXX</span></div>
            </div>
            <div>
              <div className="text-gray-600">Mode de paiement : <span className="font-medium">Virement bancaire</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Notes */}
      {showFooterNotes && notes && (
        <div className="border-t border-gray-300 pt-4 mt-6">
          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-1">Notes :</div>
            <p className="text-xs leading-relaxed">{notes}</p>
          </div>
        </div>
      )}

      {/* Footer Legal */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>TVA non applicable, article 293 B du CGI</p>
        <p className="mt-1">Merci de votre confiance</p>
      </div>
    </div>
  );
};

export default Template10;
