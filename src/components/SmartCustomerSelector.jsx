import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Plus,
  Check
} from 'lucide-react';
import { customerService } from '../services/customerService';

const SmartCustomerSelector = ({ 
  onCustomerSelect, 
  selectedCustomer, 
  onManualModeChange,
  isManualMode = false 
}) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    company: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    tax_id: '',
    phone: ''
  });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.company?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  }, [customers, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleManualModeToggle = (checked) => {
    onManualModeChange(checked);
    if (checked) {
      onCustomerSelect(null); // Clear selected customer when switching to manual mode
    } else {
      setNewCustomer({
        name: '',
        email: '',
        company: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        tax_id: '',
        phone: ''
      });
    }
  };

  const handleNewCustomerChange = (field, value) => {
    const updatedCustomer = { ...newCustomer, [field]: value };
    setNewCustomer(updatedCustomer);
    
    // Pass the new customer data to parent for form auto-fill
    onCustomerSelect({
      ...updatedCustomer,
      isNewCustomer: true
    });
  };

  return (
    <div className="space-y-4">
      {/* Smart Customer Selector Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
        <div className="text-sm text-gray-500">
          {customers.length} customers available
        </div>
      </div>

      {/* Customer Dropdown - Only show when not in manual mode */}
      {!isManualMode && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Existing Customer
          </label>
          
          {/* Search Input / Selected Customer Display */}
          <div
            className="relative cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              {selectedCustomer && selectedCustomer.name && selectedCustomer.name.trim() && !selectedCustomer.isNewCustomer ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      {selectedCustomer.company && (
                        <div className="flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>{selectedCustomer.company}</span>
                        </div>
                      )}
                      {selectedCustomer.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{selectedCustomer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Choose a customer...</span>
                  </div>
                  {isDropdownOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Customer List */}
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading customers...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-600">
                    {error}
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? 'No customers match your search' : 'No customers found'}
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {customer.company && (
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>{customer.company}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="manual-entry"
          checked={isManualMode}
          onChange={(e) => handleManualModeToggle(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label htmlFor="manual-entry" className="text-sm font-medium text-gray-700">
          Enter new customer details manually
        </label>
      </div>

      {/* Manual Customer Entry Form */}
      {isManualMode && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200 animate-slideDown">
          <div className="flex items-center space-x-2 mb-3">
            <Plus className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-900">New Customer Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => handleNewCustomerChange('name', e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={newCustomer.company}
                onChange={(e) => handleNewCustomerChange('company', e.target.value)}
                placeholder="Company name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => handleNewCustomerChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={newCustomer.address}
                onChange={(e) => handleNewCustomerChange('address', e.target.value)}
                placeholder="Street address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={newCustomer.city}
                onChange={(e) => handleNewCustomerChange('city', e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={newCustomer.postal_code}
                onChange={(e) => handleNewCustomerChange('postal_code', e.target.value)}
                placeholder="12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={newCustomer.country}
                onChange={(e) => handleNewCustomerChange('country', e.target.value)}
                placeholder="Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID
              </label>
              <input
                type="text"
                value={newCustomer.tax_id}
                onChange={(e) => handleNewCustomerChange('tax_id', e.target.value)}
                placeholder="Tax identification number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCustomerSelector;