import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Building2, 
  Users, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const AdminOrganizationsPanel = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock organizations data
  const organizations = [
    {
      id: 1,
      name: 'Acme Corporation',
      owner: 'John Doe',
      ownerEmail: 'john@acmecorp.com',
      members: 12,
      plan: 'Professional',
      status: 'active',
      trialStatus: null,
      trialEndsAt: null,
      createdAt: '2024-01-01',
      totalInvoices: 156,
      totalClients: 45
    },
    {
      id: 2,
      name: 'Demo Corp',
      owner: 'Sarah Smith',
      ownerEmail: 'sarah@democorp.com',
      members: 5,
      plan: 'Starter',
      status: 'active',
      trialStatus: null,
      trialEndsAt: null,
      createdAt: '2024-01-05',
      totalInvoices: 23,
      totalClients: 8
    },
    {
      id: 3,
      name: 'Test LLC',
      owner: 'Mike Johnson',
      ownerEmail: 'mike@testllc.com',
      members: 3,
      plan: 'Trial',
      status: 'trial',
      trialStatus: 'active',
      trialEndsAt: '2024-02-15',
      createdAt: '2024-01-10',
      totalInvoices: 5,
      totalClients: 2
    },
    {
      id: 4,
      name: 'Suspended Inc',
      owner: 'Lisa Brown',
      ownerEmail: 'lisa@suspended.com',
      members: 1,
      plan: 'Professional',
      status: 'suspended',
      trialStatus: null,
      trialEndsAt: null,
      createdAt: '2023-12-15',
      totalInvoices: 89,
      totalClients: 12
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'trial':
        return <Clock size={16} className="text-orange-500" />;
      case 'suspended':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'trial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.organizations.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.organizations.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            {t('admin.organizations.actions.addOrganization')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('admin.organizations.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t('admin.organizations.filters.allStatuses')}</option>
              <option value="active">{t('admin.organizations.filters.active')}</option>
              <option value="trial">{t('admin.organizations.filters.trial')}</option>
              <option value="suspended">{t('admin.organizations.filters.suspended')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.organizations.table.organization')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.organizations.table.owner')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.organizations.table.members')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.organizations.table.plan')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.organizations.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.organizations.table.stats')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.organizations.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {org.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.organizations.table.created')} {org.createdAt}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {org.owner}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {org.ownerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {org.members}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {org.plan}
                    </span>
                    {org.trialEndsAt && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        {t('admin.organizations.table.trialEnds')} {org.trialEndsAt}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(org.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(org.status)}`}>
                        {t(`admin.organizations.status.${org.status}`)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>{org.totalInvoices} {t('admin.organizations.table.invoices')}</div>
                      <div>{org.totalClients} {t('admin.organizations.table.clients')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 p-1">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 p-1">
                        <Trash2 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrganizations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.organizations.noResults')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrganizationsPanel;