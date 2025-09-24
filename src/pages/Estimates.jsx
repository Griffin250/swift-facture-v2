import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Estimates = () => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  // Sample data - in real app this would come from localStorage/API
  useEffect(() => {
    const sampleEstimates = [
      {
        id: '1',
        number: 'EST-2024-001',
        date: '2024-01-15',
        customer: 'Acme Corp',
        total: 2500.00,
        currency: 'USD',
        status: 'draft',
        notes: 'Website redesign project'
      },
      {
        id: '2',
        number: 'EST-2024-002',
        date: '2024-01-18',
        customer: 'Global Tech',
        total: 4200.50,
        currency: 'EUR',
        status: 'sent',
        notes: 'Mobile app development'
      },
      {
        id: '3',
        number: 'EST-2024-003',
        date: '2024-01-20',
        customer: 'Startup XYZ',
        total: 1500.00,
        currency: 'GBP',
        status: 'accepted',
        notes: 'Consulting services'
      },
      {
        id: '4',
        number: 'EST-2024-004',
        date: '2024-01-22',
        customer: 'Beta Solutions',
        total: 3200.75,
        currency: 'USD',
        status: 'declined',
        notes: 'SEO optimization'
      }
    ];
    setEstimates(sampleEstimates);
    setFilteredEstimates(sampleEstimates);
    
    // Check premium status (mock)
    setIsPremium(localStorage.getItem('premiumPlan') === 'true');
  }, []);

  // Filter estimates based on search and filters
  useEffect(() => {
    let filtered = estimates.filter(estimate => {
      const matchesSearch = 
        estimate.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (estimate.notes && estimate.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
      const matchesCurrency = currencyFilter === 'all' || estimate.currency === currencyFilter;
      
      return matchesSearch && matchesStatus && matchesCurrency;
    });
    setFilteredEstimates(filtered);
  }, [estimates, searchTerm, statusFilter, currencyFilter]);

  // Inline editing handlers
  const startEditing = (id, field, value) => {
    setEditingId(id);
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = (id) => {
    const updatedEstimates = estimates.map(estimate => 
      estimate.id === id ? { ...estimate, [editingField]: editValue } : estimate
    );
    setEstimates(updatedEstimates);
    setEditingId(null);
    setEditingField('');
    setEditValue('');
    
    // Save to localStorage in real app
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField('');
    setEditValue('');
  };

  // Status update handlers
  const updateStatus = (id, newStatus) => {
    const updatedEstimates = estimates.map(estimate =>
      estimate.id === id ? { ...estimate, status: newStatus } : estimate
    );
    setEstimates(updatedEstimates);
    
    // Save to localStorage in real app
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  // Delete handler
  const deleteEstimate = (id) => {
    if (confirm('Are you sure you want to delete this estimate?')) {
      const updatedEstimates = estimates.filter(estimate => estimate.id !== id);
      setEstimates(updatedEstimates);
      
      // Save to localStorage in real app
      localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
    }
  };

  // Bulk actions
  const toggleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const selectAllRows = () => {
    setSelectedRows(filteredEstimates.map(estimate => estimate.id));
  };

  const clearSelection = () => {
    setSelectedRows([]);
  };

  const bulkUpdateStatus = (newStatus) => {
    const updatedEstimates = estimates.map(estimate =>
      selectedRows.includes(estimate.id) ? { ...estimate, status: newStatus } : estimate
    );
    setEstimates(updatedEstimates);
    setSelectedRows([]);
    
    // Save to localStorage in real app
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  const bulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedRows.length} estimates?`)) {
      const updatedEstimates = estimates.filter(estimate => !selectedRows.includes(estimate.id));
      setEstimates(updatedEstimates);
      setSelectedRows([]);
      
      // Save to localStorage in real app
      localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
    }
  };

  // Premium feature handlers
  const handlePremiumAction = (action) => {
    if (!isPremium) {
  navigate('/premium');
      return;
    }
    // Execute premium action
    console.log(`Premium action: ${action}`);
  };

  // Calculate totals
  const totalValue = filteredEstimates.reduce((sum, estimate) => sum + estimate.total, 0);
  const statusCounts = filteredEstimates.reduce((counts, estimate) => {
    counts[estimate.status] = (counts[estimate.status] || 0) + 1;
    return counts;
  }, {});

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
            <p className="text-gray-600 mt-1">Manage your estimates and convert them to invoices</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handlePremiumAction('exportPdf')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            <button 
              onClick={() => handlePremiumAction('sendEmail')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Estimate
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search estimates by number, customer, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'draft', 'sent', 'accepted', 'declined'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Currency Filter */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Currencies</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="SEK">SEK</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-700 font-medium">
              {selectedRows.length} estimate(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => bulkUpdateStatus('sent')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Mark as Sent
              </button>
              <button
                onClick={() => bulkUpdateStatus('accepted')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
              >
                Mark as Accepted
              </button>
              <button
                onClick={() => bulkUpdateStatus('declined')}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Mark as Declined
              </button>
              <button
                onClick={bulkDelete}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Summary Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-600">Total Estimates:</span>
            <span className="font-semibold ml-2">{filteredEstimates.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Value:</span>
            <span className="font-semibold ml-2">${totalValue.toFixed(2)}</span>
          </div>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status}>
              <span className="text-gray-600 capitalize">{status}:</span>
              <span className={`font-semibold ml-2 ${getStatusBadge(status).replace('bg-', 'text-')}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredEstimates.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No estimates found</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              {estimates.length === 0 
                ? "Get started by creating your first estimate. It's quick and easy!"
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create New Estimate
            </button>
          </div>
        ) : (
          // Table
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-8 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === filteredEstimates.length && filteredEstimates.length > 0}
                      onChange={(e) => e.target.checked ? selectAllRows() : clearSelection()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEstimates.map((estimate) => (
                  <tr key={estimate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(estimate.id)}
                        onChange={() => toggleSelectRow(estimate.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    
                    {/* Number - Editable */}
                    <td className="px-4 py-3">
                      {editingId === estimate.id && editingField === 'number' ? (
                        <div className="flex gap-2">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(estimate.id)}
                          />
                          <button onClick={() => saveEdit(estimate.id)} className="text-green-600">✓</button>
                          <button onClick={cancelEdit} className="text-red-600">✕</button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(estimate.id, 'number', estimate.number)}
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          {estimate.number}
                        </div>
                      )}
                    </td>
                    
                    {/* Date - Editable */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {editingId === estimate.id && editingField === 'date' ? (
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(estimate.id)}
                          />
                          <button onClick={() => saveEdit(estimate.id)} className="text-green-600">✓</button>
                          <button onClick={cancelEdit} className="text-red-600">✕</button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(estimate.id, 'date', estimate.date)}
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          {new Date(estimate.date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    
                    {/* Customer - Editable */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {editingId === estimate.id && editingField === 'customer' ? (
                        <div className="flex gap-2">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(estimate.id)}
                          />
                          <button onClick={() => saveEdit(estimate.id)} className="text-green-600">✓</button>
                          <button onClick={cancelEdit} className="text-red-600">✕</button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(estimate.id, 'customer', estimate.customer)}
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          {estimate.customer}
                        </div>
                      )}
                    </td>
                    
                    {/* Total - Editable */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {editingId === estimate.id && editingField === 'total' ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(estimate.id)}
                          />
                          <button onClick={() => saveEdit(estimate.id)} className="text-green-600">✓</button>
                          <button onClick={cancelEdit} className="text-red-600">✕</button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(estimate.id, 'total', estimate.total)}
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          ${estimate.total.toFixed(2)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-sm text-gray-500">{estimate.currency}</td>
                    
                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(estimate.status)}`}>
                        {estimate.status}
                      </span>
                    </td>
                    
                    {/* Notes - Editable */}
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {editingId === estimate.id && editingField === 'notes' ? (
                        <div className="flex gap-2">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(estimate.id)}
                          />
                          <button onClick={() => saveEdit(estimate.id)} className="text-green-600">✓</button>
                          <button onClick={cancelEdit} className="text-red-600">✕</button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(estimate.id, 'notes', estimate.notes)}
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded truncate"
                          title={estimate.notes}
                        >
                          {estimate.notes}
                        </div>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePremiumAction('convertToInvoice')}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded"
                          title="Convert to Invoice"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        <div className="relative group">
                          <button className="p-1 text-gray-600 hover:text-gray-800 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => updateStatus(estimate.id, 'sent')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Sent
                              </button>
                              <button
                                onClick={() => updateStatus(estimate.id, 'accepted')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Accepted
                              </button>
                              <button
                                onClick={() => updateStatus(estimate.id, 'declined')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Declined
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => deleteEstimate(estimate.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete Estimate
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Tip: Change number, customer, total, or notes inline. Use the icons to update status or delete an estimate.</p>
      </div>
    </div>
  );
};

export default Estimates;