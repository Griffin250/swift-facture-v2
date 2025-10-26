import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Receipt, 
  Calculator, 
  Eye, 
  Download, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User,
  CreditCard,
  FileCheck,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { adminDocumentService } from '../../../services/adminService';

const AdminDocumentsPanel = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    invoices: 0,
    estimates: 0,
    receipts: 0,
    totalValue: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    documentType: '',
    status: '',
    userId: '',
    search: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch documents
  const fetchDocuments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching documents...', { page, itemsPerPage });
      
      const filterObj = {
        documentType: filters.documentType || undefined,
        status: filters.status || undefined,
        userId: filters.userId || undefined,
        dateRange: (filters.dateRange.start || filters.dateRange.end) ? filters.dateRange : undefined
      };

      console.log('📊 Filter object:', filterObj);
      
      // Let's try a simple test first - directly query one table
      console.log('🧪 Testing direct table access...');
      
      const result = await adminDocumentService.getAllDocuments(page, itemsPerPage, filterObj);
      console.log('📋 Service result:', result);
      
      // Check if we got any error
      if (result.error) {
        console.error('❌ Service returned error:', result.error);
        throw result.error;
      }
      
      // Filter by search term if provided
      let filteredDocuments = result.documents || [];
      console.log('📄 Documents before filtering:', filteredDocuments.length);
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.document_number?.toLowerCase().includes(searchTerm) ||
          doc.customer_name?.toLowerCase().includes(searchTerm) ||
          doc.profiles?.email?.toLowerCase().includes(searchTerm) ||
          doc.profiles?.full_name?.toLowerCase().includes(searchTerm)
        );
        console.log('📄 Documents after search filtering:', filteredDocuments.length);
      }

      console.log('✅ Setting documents:', filteredDocuments.length);
      setDocuments(filteredDocuments || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(Math.ceil((result.totalCount || 0) / itemsPerPage));
      setStats(result.stats || {
        total: 0,
        invoices: 0,
        estimates: 0,
        receipts: 0,
        totalValue: 0
      });
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);

  // Fetch documents on component mount and filter changes
  useEffect(() => {
    fetchDocuments(1);
    setCurrentPage(1);
  }, [fetchDocuments]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchDocuments(page);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle date range filter
  const handleDateRangeChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      documentType: '',
      status: '',
      userId: '',
      search: '',
      dateRange: { start: '', end: '' }
    });
  };

  // Handle view document
  const handleViewDocument = (doc) => {
    console.log('👁️ View document:', doc);
    // TODO: Navigate to the appropriate document view page
    const documentType = doc.document_type;
    const documentId = doc.id;
    
    // Navigate based on document type
    if (documentType === 'invoice' || documentType === 'french_invoice') {
      window.open(`/invoice?id=${documentId}`, '_blank');
    } else if (documentType === 'estimate') {
      window.open(`/estimate?id=${documentId}`, '_blank');
    } else if (documentType === 'receipt') {
      window.open(`/receipts?id=${documentId}`, '_blank');
    }
  };

  // Handle download document
  const handleDownloadDocument = (doc) => {
    console.log('📥 Download document:', doc);
    // TODO: Generate and download PDF
    alert(`Download functionality for ${doc.document_type} ${doc.document_number} will be implemented soon.`);
  };

  // Get document type icon
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'french_invoice':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'estimate':
        return <Calculator className="w-5 h-5 text-green-600" />;
      case 'receipt':
        return <Receipt className="w-5 h-5 text-orange-600" />;
      default:
        return <FileCheck className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get document type label
  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'invoice':
        return 'Invoice';
      case 'french_invoice':
        return 'French Invoice';
      case 'estimate':
        return 'Estimate';
      case 'receipt':
        return 'Receipt';
      default:
        return 'Document';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Documents</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDocuments(currentPage)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents Management</h1>
          <p className="text-gray-600">View and manage all documents across all users</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <FileCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.invoices || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>


        
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estimates</p>
              <p className="text-2xl font-bold text-green-600">{stats?.estimates || 0}</p>
            </div>
            <Calculator className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receipts</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.receipts || 0}</p>
            </div>
            <Receipt className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(stats?.totalValue || 0, 'EUR')}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by document number, customer, or user email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideDown">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={filters.documentType}
                onChange={(e) => handleFilterChange('documentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="invoice">Invoices (including French)</option>
                <option value="estimate">Estimates</option>
                <option value="receipt">Receipts</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters */}
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No documents found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => (
                  <tr key={`${doc.document_type}-${doc.id}`} className="hover:bg-gray-50 transition-colors animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getDocumentIcon(doc.document_type)}
                        <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {doc.document_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getDocumentTypeLabel(doc.document_type)}
                        </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.customer_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.profiles?.full_name || 
                             doc.profiles?.name ||
                             `${doc.profiles?.first_name || ''} ${doc.profiles?.last_name || ''}`.trim() ||
                             doc.profiles?.username ||
                             `User ${doc.user_id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.profiles?.email || 'Email not available'}
                          </div>
                          {doc.profiles && (
                            <div className="text-xs text-gray-400">
                              Creator ID: {doc.user_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(doc.date || doc.created_at)}
                          </div>
                          {doc.due_date && (
                            <div className="text-xs text-gray-500">
                              Due: {formatDate(doc.due_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(parseFloat(doc.total || 0), 'EUR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.status ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} documents
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentsPanel;