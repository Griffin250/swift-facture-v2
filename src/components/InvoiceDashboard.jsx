import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Copy, 
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils/formatCurrency";

const InvoiceDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch invoices from localStorage
  const fetchInvoices = () => {
    try {
      const savedInvoices = JSON.parse(localStorage.getItem('savedInvoices') || '[]');
      setInvoices(savedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchesSearch = 
        (inv.invoice?.number && inv.invoice.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.billTo?.name && inv.billTo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.yourCompany?.name && inv.yourCompany.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.notes && inv.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCurrency = currencyFilter === 'All' || inv.selectedCurrency === currencyFilter;
      const matchesStatus = statusFilter === 'All' || (inv.status || 'draft') === statusFilter;
      
      return matchesSearch && matchesCurrency && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.savedAt || a.invoice?.date || '1970-01-01');
          bValue = new Date(b.savedAt || b.invoice?.date || '1970-01-01');
          break;
        case 'number':
          aValue = a.invoice?.number || '';
          bValue = b.invoice?.number || '';
          break;
        case 'customer':
          aValue = a.billTo?.name || '';
          bValue = b.billTo?.name || '';
          break;
        case 'total':
          aValue = a.grandTotal || 0;
          bValue = b.grandTotal || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Actions
  const editInvoice = (invoice) => {
    // Navigate to main form with pre-filled data
    navigate('/', { state: { invoiceData: invoice } });
  };

  const previewInvoice = (invoice) => {
    // Navigate to template page with invoice data
    navigate('/template', {
      state: {
        formData: invoice,
        selectedTemplate: 1
      }
    });
  };

  const duplicateInvoice = (invoice) => {
    const duplicatedInvoice = {
      ...invoice,
      invoice: {
        ...invoice.invoice,
        number: `${invoice.invoice?.number || 'INV'}-COPY-${Date.now()}`,
        date: new Date().toISOString().split('T')[0]
      },
      savedAt: new Date().toISOString()
    };
    
    const savedInvoices = JSON.parse(localStorage.getItem('savedInvoices') || '[]');
    savedInvoices.push(duplicatedInvoice);
    localStorage.setItem('savedInvoices', JSON.stringify(savedInvoices));
    fetchInvoices();
  };

  const deleteInvoice = (invoiceNumber) => {
    if (window.confirm(t('invoiceDashboard.confirmDelete'))) {
      const savedInvoices = JSON.parse(localStorage.getItem('savedInvoices') || '[]');
      const filteredInvoices = savedInvoices.filter(inv => inv.invoice?.number !== invoiceNumber);
      localStorage.setItem('savedInvoices', JSON.stringify(filteredInvoices));
      fetchInvoices();
    }
  };

  const changeStatus = (invoiceNumber, newStatus) => {
    const savedInvoices = JSON.parse(localStorage.getItem('savedInvoices') || '[]');
    const invoiceIndex = savedInvoices.findIndex(inv => inv.invoice?.number === invoiceNumber);
    
    if (invoiceIndex !== -1) {
      savedInvoices[invoiceIndex].status = newStatus;
      localStorage.setItem('savedInvoices', JSON.stringify(savedInvoices));
      fetchInvoices();
    }
  };

  const sendEmail = (invoice) => {
    const subject = `Invoice ${invoice.invoice?.number || 'N/A'}`;
    const body = `Please find attached the invoice ${invoice.invoice?.number || 'N/A'} dated ${invoice.invoice?.date || 'N/A'}.`;
    const mailtoLink = `mailto:${invoice.billTo?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('invoiceDashboard.title')}
          </h2>
          <p className="text-gray-600">
            {t('invoiceDashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-sm text-gray-500">
            {filteredInvoices.length} {t('invoiceDashboard.invoices')}
          </span>
          <Button
            onClick={() => {
              // Scroll to invoice form
              const invoiceForm = document.querySelector('.invoice-form-section');
              if (invoiceForm) {
                invoiceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {t('invoiceDashboard.createNewInvoice')}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('invoiceDashboard.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {t('invoiceDashboard.filters')}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('invoiceDashboard.status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">{t('invoiceDashboard.allStatuses')}</option>
              <option value="draft">{t('invoiceDashboard.draft')}</option>
              <option value="sent">{t('invoiceDashboard.sent')}</option>
              <option value="paid">{t('invoiceDashboard.paid')}</option>
              <option value="overdue">{t('invoiceDashboard.overdue')}</option>
              <option value="cancelled">{t('invoiceDashboard.cancelled')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('invoiceDashboard.currency')}
            </label>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">{t('invoiceDashboard.allCurrencies')}</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('invoiceDashboard.sortBy')}
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date-desc">{t('invoiceDashboard.newestFirst')}</option>
              <option value="date-asc">{t('invoiceDashboard.oldestFirst')}</option>
              <option value="number-asc">{t('invoiceDashboard.numberAZ')}</option>
              <option value="number-desc">{t('invoiceDashboard.numberZA')}</option>
              <option value="customer-asc">{t('invoiceDashboard.customerAZ')}</option>
              <option value="customer-desc">{t('invoiceDashboard.customerZA')}</option>
              <option value="total-desc">{t('invoiceDashboard.amountHighLow')}</option>
              <option value="total-asc">{t('invoiceDashboard.amountLowHigh')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileCheck className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('invoiceDashboard.noInvoicesTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('invoiceDashboard.noInvoicesDescription')}
            </p>
            <Button
              onClick={() => {
                // Scroll to invoice form
                const invoiceForm = document.querySelector('.invoice-form-section');
                if (invoiceForm) {
                  invoiceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {t('invoiceDashboard.createFirstInvoice')}
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('invoiceDashboard.invoiceNumber')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('invoiceDashboard.date')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('invoiceDashboard.customer')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('invoiceDashboard.amount')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('invoiceDashboard.status')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('invoiceDashboard.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.invoice?.number || Math.random()} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono font-semibold text-blue-700">
                    {invoice.invoice?.number || 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {invoice.invoice?.date || new Date(invoice.savedAt).toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    {invoice.billTo?.name || 'N/A'}
                  </td>
                  <td className="py-4 px-4 font-bold text-blue-700">
                    {formatCurrency(invoice.grandTotal || 0, invoice.selectedCurrency || 'USD')}
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={invoice.status || 'draft'}
                      onChange={(e) => changeStatus(invoice.invoice?.number, e.target.value)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(invoice.status || 'draft')}`}
                    >
                      <option value="draft">{t('invoiceDashboard.draft')}</option>
                      <option value="sent">{t('invoiceDashboard.sent')}</option>
                      <option value="paid">{t('invoiceDashboard.paid')}</option>
                      <option value="overdue">{t('invoiceDashboard.overdue')}</option>
                      <option value="cancelled">{t('invoiceDashboard.cancelled')}</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => previewInvoice(invoice)}
                        className="text-purple-600 hover:text-purple-800 p-2 rounded hover:bg-purple-50 transition-colors"
                        title={t('invoiceDashboard.preview')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => editInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                        title={t('invoiceDashboard.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateInvoice(invoice)}
                        className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition-colors"
                        title={t('invoiceDashboard.duplicate')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => sendEmail(invoice)}
                        className="text-orange-600 hover:text-orange-800 p-2 rounded hover:bg-orange-50 transition-colors"
                        title={t('invoiceDashboard.sendEmail')}
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteInvoice(invoice.invoice?.number)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                        title={t('invoiceDashboard.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceDashboard;