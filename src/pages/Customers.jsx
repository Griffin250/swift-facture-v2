import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { customerService } from '../services/customerService';
import { useAuth } from '../contexts/AuthContext';

const Customers = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for customers data
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'customer_number', direction: 'asc' });
  
  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    customer_type: 'business',
    name: '',
    company_name: '',
    email: '',
    phone: '',
    mobile_phone: '',
    website: '',
    street_address: '',
    city: '',
    postal_code: '',
    state_province: '',
    country: '',
    vat_id: '',
    currency: 'EUR',
    status: 'active',
    notes: ''
  });

  // Refs for inline editing
  const editRefs = useRef({});
  const modalRef = useRef(null);

  // Load customers from database
  const loadCustomers = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const customersData = await customerService.getAllCustomers();
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customers');
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Handle click outside modal to close it and ESC key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isModalOpen]);



  // Sort customers - combined with filtering
  useEffect(() => {
    let filtered = customers;
    
    // Apply search filter
    if (searchTerm) {
      filtered = customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.vat_id?.includes(searchTerm) ||
        `${customer.address || ''}`
          .toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredCustomers(sorted);
  }, [searchTerm, customers, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Handle inline editing
  const handleEditStart = (customerId, field) => {
    setEditingCustomerId(customerId);
    // Focus the input field after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (editRefs.current[`${customerId}-${field}`]) {
        editRefs.current[`${customerId}-${field}`].focus();
      }
    }, 10);
  };

  const handleEditChange = async (customerId, field, value) => {
    try {
      // Update in database
      await customerService.updateCustomer(customerId, { [field]: value });
      
      // Update local state
      const updatedCustomers = customers.map(customer => 
        customer.id === customerId ? { ...customer, [field]: value } : customer
      );
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  };

  const handleEditBlur = () => {
    setEditingCustomerId(null);
  };

  // Reset form to initial state
  const resetForm = () => {
    setCustomerForm({
      customer_type: 'business',
      name: '',
      company_name: '',
      email: '',
      phone: '',
      mobile_phone: '',
      website: '',
      street_address: '',
      city: '',
      postal_code: '',
      state_province: '',
      country: '',
      vat_id: '',
      currency: 'EUR',
      status: 'active',
      notes: ''
    });
  };

  // Open modal for creating new customer
  const handleOpenCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    setEditingCustomerId(null);
    setIsModalOpen(true);
  };

  // Open modal for editing existing customer
  const handleOpenEditModal = (customer) => {
    setCustomerForm({
      customer_type: customer.customer_type || 'business',
      name: customer.name || '',
      company_name: customer.company_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      mobile_phone: customer.mobile_phone || '',
      website: customer.website || '',
      street_address: customer.street_address || customer.address || '',
      city: customer.city || '',
      postal_code: customer.postal_code || '',
      state_province: customer.state_province || '',
      country: customer.country || '',
      vat_id: customer.vat_id || '',
      currency: customer.currency || 'EUR',
      status: customer.status || 'active',
      notes: customer.notes || ''
    });
    setIsEditMode(true);
    setEditingCustomerId(customer.id);
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setCustomerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && editingCustomerId) {
        // Update existing customer
        const updatedCustomer = await customerService.updateCustomer(editingCustomerId, customerForm);
        
        // Update local state
        const updatedCustomers = customers.map(customer => 
          customer.id === editingCustomerId ? updatedCustomer : customer
        );
        setCustomers(updatedCustomers);
      } else {
        // Create new customer
        const newCustomer = await customerService.createCustomer(customerForm);
        
        // Add to local state
        const updatedCustomers = [newCustomer, ...customers];
        setCustomers(updatedCustomers);
      }
      
      // Close modal and reset form
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm(t('customers.messages.deleteConfirm') || 'Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(customerId);
        const updatedCustomers = customers.filter(customer => customer.id !== customerId);
        setCustomers(updatedCustomers);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4 text-gray-600">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-4">Error Loading Customers</h2>
            <p className="text-sm mb-4">{error}</p>
            <button 
              onClick={loadCustomers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-600 mb-4">
              <h2 className="text-2xl font-bold mb-2">Error Loading Customers</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={loadCustomers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('customers.title')}</h1>
        <p className="text-gray-600 mt-2">{t('customers.subtitle')}</p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={t('customers.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('customers.addNew')}
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customer_number')}
                >
                  <div className="flex items-center">
                    {t('customers.table.number')}
                    {sortConfig.key === 'customer_number' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    {t('customers.table.name')}
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.table.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.table.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.table.phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.table.address')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{customer.customer_number || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                      {customer.company_name && (
                        <div className="text-sm text-gray-500">
                          {customer.company_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.customer_type === 'business' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {t(`customers.types.${customer.customer_type || 'business'}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone || '-'}</div>
                      {customer.mobile_phone && (
                        <div className="text-sm text-gray-500">{customer.mobile_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm text-gray-900">
                        {[customer.street_address, customer.city, customer.postal_code, customer.country]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' :
                        customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        customer.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(`customers.status.${customer.status || 'active'}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(customer)}
                        className="text-blue-600 hover:text-blue-900 transition duration-150"
                      >
                        {t('buttons.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                      >
                        {t('buttons.delete')}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {customers.length === 0 ? 'No customers yet. Add your first customer!' : 'No customers match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? t('customers.editCustomer') : t('customers.addNew')}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label={t('buttons.close')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('customers.form.customerType')}
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="customer_type"
                        value="business"
                        checked={customerForm.customer_type === 'business'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">{t('customers.types.business')}</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="customer_type"
                        value="individual"
                        checked={customerForm.customer_type === 'individual'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">{t('customers.types.individual')}</span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email and Phone */}
                {/* Company Name */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.companyName')}
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={customerForm.company_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email and Phone */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerForm.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Mobile Phone and Website */}
                <div>
                  <label htmlFor="mobile_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.mobilePhone')}
                  </label>
                  <input
                    type="tel"
                    id="mobile_phone"
                    name="mobile_phone"
                    value={customerForm.mobile_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.website')}
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={customerForm.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address Section */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{t('customers.form.addressSection')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('customers.form.streetAddress')}
                      </label>
                      <input
                        type="text"
                        id="street_address"
                        name="street_address"
                        value={customerForm.street_address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('customers.form.city')}
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={customerForm.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('customers.form.postalCode')}
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        value={customerForm.postal_code}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="state_province" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('customers.form.stateProvince')}
                      </label>
                      <input
                        type="text"
                        id="state_province"
                        name="state_province"
                        value={customerForm.state_province}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('customers.form.country')}
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={customerForm.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* VAT ID and Currency */}
                <div>
                  <label htmlFor="vat_id" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.vatId')}
                  </label>
                  <input
                    type="text"
                    id="vat_id"
                    name="vat_id"
                    value={customerForm.vat_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.defaultCurrency')}
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={customerForm.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.status')}
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={customerForm.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">{t('customers.status.active')}</option>
                    <option value="inactive">{t('customers.status.inactive')}</option>
                    <option value="pending">{t('customers.status.pending')}</option>
                    <option value="blocked">{t('customers.status.blocked')}</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('customers.form.notes')}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={customerForm.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEditMode ? t('customers.actions.update') : t('customers.actions.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;