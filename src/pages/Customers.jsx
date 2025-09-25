import React, { useState, useEffect, useRef } from 'react';

const Customers = () => {
  // State for customers data
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    type: 'business',
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: ''
    },
    vatId: '',
    currency: 'EUR',
    notes: ''
  });

  // Refs for inline editing
  const editRefs = useRef({});

  // Load customers from localStorage on component mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      const parsedCustomers = JSON.parse(savedCustomers);
      setCustomers(parsedCustomers);
      setFilteredCustomers(parsedCustomers);
    }
  }, []);

  // Save customers to localStorage whenever customers change
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.vatId.includes(searchTerm) ||
        `${customer.address.street} ${customer.address.city} ${customer.address.postalCode} ${customer.address.country}`
          .toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  // Sort customers
  useEffect(() => {
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setFilteredCustomers(sortedCustomers);
  }, [sortConfig]);

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

  const handleEditChange = (customerId, field, value) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === customerId ? { ...customer, [field]: value } : customer
    );
    setCustomers(updatedCustomers);
  };

  const handleEditBlur = () => {
    setEditingCustomerId(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewCustomer({
        ...newCustomer,
        [parent]: {
          ...newCustomer[parent],
          [child]: value
        }
      });
    } else {
      setNewCustomer({
        ...newCustomer,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const customerWithId = {
      ...newCustomer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedCustomers = [customerWithId, ...customers];
    setCustomers(updatedCustomers);
    setNewCustomer({
      type: 'business',
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      },
      vatId: '',
      currency: 'EUR',
      notes: ''
    });
    setIsModalOpen(false);
  };

  // Handle customer deletion
  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updatedCustomers = customers.filter(customer => customer.id !== customerId);
      setCustomers(updatedCustomers);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-2">Manage your customer database</p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search customers..."
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
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Customer
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
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT ID
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('currency')}
                >
                  <div className="flex items-center">
                    Currency
                    {sortConfig.key === 'currency' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCustomerId === customer.id ? (
                        <input
                          ref={el => editRefs.current[`${customer.id}-name`] = el}
                          type="text"
                          value={customer.name}
                          onChange={(e) => handleEditChange(customer.id, 'name', e.target.value)}
                          onBlur={handleEditBlur}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleEditStart(customer.id, 'name')}
                        >
                          {customer.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCustomerId === customer.id ? (
                        <input
                          ref={el => editRefs.current[`${customer.id}-email`] = el}
                          type="email"
                          value={customer.email}
                          onChange={(e) => handleEditChange(customer.id, 'email', e.target.value)}
                          onBlur={handleEditBlur}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleEditStart(customer.id, 'email')}
                        >
                          {customer.email || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCustomerId === customer.id ? (
                        <input
                          ref={el => editRefs.current[`${customer.id}-phone`] = el}
                          type="tel"
                          value={customer.phone}
                          onChange={(e) => handleEditChange(customer.id, 'phone', e.target.value)}
                          onBlur={handleEditBlur}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleEditStart(customer.id, 'phone')}
                        >
                          {customer.phone || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate">
                        {customer.address.street}, {customer.address.city}, {customer.address.postalCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCustomerId === customer.id ? (
                        <input
                          ref={el => editRefs.current[`${customer.id}-vatId`] = el}
                          type="text"
                          value={customer.vatId}
                          onChange={(e) => handleEditChange(customer.id, 'vatId', e.target.value)}
                          onBlur={handleEditBlur}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleEditStart(customer.id, 'vatId')}
                        >
                          {customer.vatId || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                      >
                        Delete
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Add New Customer</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="business"
                        checked={newCustomer.type === 'business'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Business</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="individual"
                        checked={newCustomer.type === 'individual'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Individual</span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email and Phone */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newCustomer.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Billing Address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={newCustomer.address.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={newCustomer.address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="address.postalCode"
                        name="address.postalCode"
                        value={newCustomer.address.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={newCustomer.address.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* VAT ID and Currency */}
                <div>
                  <label htmlFor="vatId" className="block text-sm font-medium text-gray-700 mb-1">
                    VAT ID / Tax Number
                  </label>
                  <input
                    type="text"
                    id="vatId"
                    name="vatId"
                    value={newCustomer.vatId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={newCustomer.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={newCustomer.notes}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Customer
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