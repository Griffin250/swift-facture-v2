import { useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils/formatCurrency";
import { invoiceService } from "../services/invoiceService";
import { estimateService } from "../services/estimateService";
import { frenchInvoiceService } from "../services/frenchInvoiceService";
import { userSettingsService } from "../services/userSettingsService";
import { useAuth } from "../contexts/AuthContext";

const InvoiceDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Fetch invoices from database
  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch invoices and estimates
      const [regularInvoicesData, frenchInvoicesData, estimatesResult] = await Promise.all([
        invoiceService.getAllInvoices(),
        frenchInvoiceService.getAllFrenchInvoices(),
        estimateService.getAllEstimates()
      ]);

      // Transform regular invoices
      const transformedRegularInvoices = regularInvoicesData
        .filter(inv => inv.template_name !== 'french_invoice')
        .map(inv => ({
          id: inv.id,
          type: 'regular',
          invoice: {
            number: inv.invoice_number,
            date: inv.date,
            paymentDate: inv.due_date,
          },
          billTo: {
            name: inv.customer?.name || 'N/A',
            address: inv.customer?.address || '',
            phone: inv.customer?.phone || '',
          },
          shipTo: {
            name: inv.customer?.name || 'N/A',
            address: inv.customer?.address || '',
            phone: inv.customer?.phone || '',
          },
          yourCompany: {
            name: 'Your Company',
            address: '',
            phone: '',
          },
          items: inv.invoice_items || [],
          taxPercentage: 0,
          taxAmount: inv.tax,
          subTotal: inv.subtotal,
          grandTotal: inv.total,
          notes: inv.notes,
          selectedCurrency: inv.currency || 'EUR',
          status: inv.status,
          savedAt: inv.created_at,
          template: 'Regular Invoice'
        }));

      // Transform French invoices
      const transformedFrenchInvoices = frenchInvoicesData.map(inv => {
        let frenchData = {};
        try {
          const parsedNotes = JSON.parse(inv.notes || '{}');
          frenchData = parsedNotes.type === 'french_invoice' ? parsedNotes : {};
        } catch (e) {
          console.warn('Could not parse French invoice data:', e);
        }
        return {
          id: inv.id,
          type: 'french',
          invoice: {
            number: inv.invoice_number,
            date: inv.date,
            paymentDate: inv.due_date,
          },
          billTo: {
            name: frenchData.client?.name || 'N/A',
            address: frenchData.client?.address || '',
            phone: frenchData.client?.phone || '',
          },
          shipTo: {
            name: frenchData.client?.name || 'N/A',
            address: frenchData.client?.address || '',
            phone: frenchData.client?.phone || '',
          },
          yourCompany: {
            name: frenchData.company?.name || 'Your Company',
            address: frenchData.company?.address || '',
            phone: frenchData.company?.phone || '',
          },
          items: inv.invoice_items || [],
          taxPercentage: 0,
          taxAmount: inv.tax,
          subTotal: inv.subtotal,
          grandTotal: inv.total,
          notes: frenchData.userNotes || '',
          selectedCurrency: 'EUR',
          status: inv.status,
          savedAt: inv.created_at,
          template: 'French Invoice'
        };
      });

      // Transform estimates
      const transformedEstimates = (estimatesResult.data || []).map(est => ({
        id: est.id,
        type: 'estimate',
        invoice: {
          number: est.estimate_number,
          date: est.date,
          paymentDate: est.valid_until,
        },
        billTo: {
          name: est.customers?.name || 'N/A',
          address: est.customers?.address || '',
          phone: est.customers?.phone || '',
        },
        shipTo: {
          name: est.customers?.name || 'N/A',
          address: est.customers?.address || '',
          phone: est.customers?.phone || '',
        },
        yourCompany: {
          name: 'Your Company',
          address: '',
          phone: '',
        },
        items: est.estimate_items || est.items || [],
        taxPercentage: 0,
        taxAmount: est.tax,
        subTotal: est.subtotal,
        grandTotal: est.total,
        notes: est.notes,
        selectedCurrency: est.currency || 'EUR',
        status: est.status,
        savedAt: est.created_at,
        template: 'Estimate'
      }));

      // Combine all invoices and estimates
      const allInvoices = [
        ...transformedRegularInvoices,
        ...transformedFrenchInvoices,
        ...transformedEstimates
      ];
      setInvoices(allInvoices);
  // Estimates are now included in invoices list
    } catch (error) {
      console.error('Error fetching invoices/estimates:', error);
      setError('Failed to load invoices/estimates');
      setInvoices([]);
  // Estimates are now included in invoices list
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, currencyFilter]);

  // Actions
  const editInvoice = (invoice) => {
    // Navigate to invoice form with pre-filled data
    navigate('/invoice', { state: { invoiceData: invoice } });
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

  const duplicateInvoice = async (invoice) => {
    try {
      // Generate new invoice number for the duplicate
      const newInvoiceNumber = await userSettingsService.generateInvoiceNumber();
      
      const duplicateData = {
        invoice_number: newInvoiceNumber,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: invoice.invoice?.paymentDate,
        subtotal: invoice.subTotal,
        tax_rate: invoice.taxPercentage,
        tax_amount: invoice.taxAmount,
        total_amount: invoice.grandTotal,
        currency: invoice.selectedCurrency,
        notes: invoice.notes,
        
        // Company information
        company_name: invoice.yourCompany?.name,
        company_address: invoice.yourCompany?.address,
        company_phone: invoice.yourCompany?.phone,
        
        // Bill to information
        bill_to_name: invoice.billTo?.name,
        bill_to_address: invoice.billTo?.address,
        bill_to_phone: invoice.billTo?.phone,
        
        // Ship to information
        ship_to_name: invoice.shipTo?.name,
        ship_to_address: invoice.shipTo?.address,
        ship_to_phone: invoice.shipTo?.phone,
        
        // Items
        items: invoice.items?.map(item => ({
          name: item.name,
          description: item.description,
          quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.amount) || parseFloat(item.unit_price) || 0,
          total: parseFloat(item.total) || 0
        })) || []
      };
      
      await invoiceService.createInvoice(duplicateData);
      await fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      alert('Failed to duplicate invoice. Please try again.');
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (window.confirm(t('invoiceDashboard.confirmDelete'))) {
      try {
        await invoiceService.deleteInvoice(invoiceId);
        await fetchInvoices(); // Refresh the list
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const changeStatus = async (invoiceId, newStatus) => {
    try {
      await invoiceService.updateInvoiceStatus(invoiceId, newStatus);
      await fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Failed to update invoice status. Please try again.');
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



  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading invoices...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold mb-2">Error Loading Invoices</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={fetchInvoices} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {filteredInvoices.length > 0 
              ? `${startIndex + 1}-${Math.min(endIndex, filteredInvoices.length)} ${t('invoiceDashboard.pagination.of')} ${filteredInvoices.length} ${t('invoiceDashboard.invoices')}`
              : `0 ${t('invoiceDashboard.invoices')}`
            }
          </span>
          <Button
            onClick={() => navigate('/invoice')}
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
              onClick={() => navigate('/invoice')}
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
                  {t('invoiceDashboard.type', 'Type')}
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
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id || invoice.invoice?.number || Math.random()} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono font-semibold text-blue-700">
                    {invoice.invoice?.number || 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {invoice.invoice?.date || new Date(invoice.savedAt).toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    {invoice.billTo?.name || 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.template === 'French Invoice' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.template || 'Regular Invoice'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-blue-700">
                    {formatCurrency(invoice.grandTotal || 0, invoice.selectedCurrency || 'USD')}
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={invoice.status || 'draft'}
                      onChange={(e) => changeStatus(invoice.id, e.target.value)}
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
                        onClick={() => deleteInvoice(invoice.id)}
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

      {/* Pagination Controls */}
      {filteredInvoices.length > itemsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('invoiceDashboard.pagination.previous')}
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('invoiceDashboard.pagination.next')}
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t('invoiceDashboard.pagination.showing')} <span className="font-medium">{startIndex + 1}</span> {t('invoiceDashboard.pagination.to')}{' '}
                <span className="font-medium">{Math.min(endIndex, filteredInvoices.length)}</span> {t('invoiceDashboard.pagination.of')}{' '}
                <span className="font-medium">{filteredInvoices.length}</span> {t('invoiceDashboard.pagination.results')}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label={t('invoiceDashboard.pagination.page')}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current page
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } border`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDashboard;