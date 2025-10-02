import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  UserMinus, 
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { adminUserService } from '../../../services/adminService';

const AdminUsersPanel = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (roleFilter !== 'all') filters.role = roleFilter;

      const result = await adminUserService.getUsers({
        page: currentPage,
        limit: usersPerPage,
        search: searchQuery,
        filters
      });

      if (result.error) {
        throw result.error;
      }

      setUsers(result.data.users || []);
      setTotalUsers(result.data.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId) => {
    try {
      // Placeholder for edit user functionality
      console.log('Edit user:', userId);
      // You can open a modal or navigate to edit page
    } catch (err) {
      console.error('Error editing user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm(t('admin.users.confirmDelete', 'Are you sure you want to delete this user?'))) {
      return;
    }

    try {
      const result = await adminUserService.deleteUser(userId);
      if (result.error) {
        throw result.error;
      }
      
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(t('admin.users.deleteError', 'Failed to delete user'));
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const result = await adminUserService.resetUserPassword(userId);
      if (result.error) {
        throw result.error;
      }
      
      alert(t('admin.users.passwordResetSuccess', 'Password reset email sent successfully'));
    } catch (err) {
      console.error('Error resetting password:', err);
      alert(t('admin.users.passwordResetError', 'Failed to reset password'));
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.users.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.users.subtitle')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {t('common.loading', 'Loading...')}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.users.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.users.subtitle')}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
          <button 
            onClick={fetchUsers}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.users.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.users.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
            <Plus size={18} className="mr-2" />
            {t('admin.users.actions.addUser')}
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
              placeholder={t('admin.users.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t('admin.users.filters.allStatuses')}</option>
              <option value="active">{t('admin.users.filters.active')}</option>
              <option value="trial">{t('admin.users.filters.trial')}</option>
              <option value="suspended">{t('admin.users.filters.suspended')}</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t('admin.users.filters.allRoles')}</option>
              <option value="owner">{t('admin.users.filters.owner')}</option>
              <option value="admin">{t('admin.users.filters.admin')}</option>
              <option value="user">{t('admin.users.filters.user')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.table.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.table.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.table.organization')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.table.lastLogin')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name || user.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {user.role || 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {user.company_name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status || 'active')}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status || 'active')}`}>
                        {t(`admin.users.status.${user.status || 'active'}`)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(user.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1"
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 p-1"
                        title="Reset password"
                      >
                        <Key size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 p-1"
                        title="Delete user"
                      >
                        <UserMinus size={16} />
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

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.users.noResults')}
            </p>
          </div>
        )}
      </div>

      {/* Pagination would go here */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {t('admin.users.pagination.showing', { 
            start: ((currentPage - 1) * usersPerPage) + 1, 
            end: Math.min(currentPage * usersPerPage, totalUsers), 
            total: totalUsers 
          })}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.users.pagination.previous')}
          </button>
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage * usersPerPage >= totalUsers}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.users.pagination.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPanel;