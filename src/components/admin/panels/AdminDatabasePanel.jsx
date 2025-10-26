import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// Register Chart.js components if not already registered
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  Users, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Loader2,
  AlertCircle,
  BarChart2
} from 'lucide-react';

const AdminDatabasePanel = () => {
  // Prepare user growth data for chart
  const getUserGrowthData = () => {
    // Group users by created_at date (YYYY-MM-DD)
    const counts = {};
    users.forEach(u => {
      const d = new Date(u.created_at).toISOString().split('T')[0];
      counts[d] = (counts[d] || 0) + 1;
    });
    // Get last 14 days
    const days = Array.from({length: 14}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });
    let runningTotal = 0;
    const data = days.map(day => {
      runningTotal += counts[day] || 0;
      return runningTotal;
    });
    return {
      labels: days,
      datasets: [
        {
          label: 'Total Users',
          data,
          borderColor: 'rgb(59,130,246)',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  // Export users as CSV
  const exportUsersCSV = () => {
    const header = ['Name','Email','Created','Last signed in','Role'];
    const rows = filteredUsers.map(u => {
      const userRole = userRoles.find(r => r.user_id === u.id);
      return [
        getUserName(u.id),
        u.email,
        new Date(u.created_at).toLocaleDateString(),
        u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : '-',
        userRole ? userRole.role : 'None'
      ];
    });
    const csv = [header, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const { t } = useTranslation('common');
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, newSignups: 0, dau: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ user_id: '', role: 'user' });
  const [showAddRole, setShowAddRole] = useState(false);

  const roleOptions = ['user', 'admin', 'super_admin'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersError) throw usersError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      if (rolesError) throw rolesError;

      // Calculate stats
      const now = new Date();
      const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const total = usersData.length;
      const newSignups = usersData.filter(u => new Date(u.created_at) >= last7).length;
      // Simulate DAU: count users with last_sign_in within 1 day
      const dau = usersData.filter(u => {
        if (!u.last_sign_in) return false;
        const lastSignIn = new Date(u.last_sign_in);
        return (now - lastSignIn) < 24 * 60 * 60 * 1000;
      }).length;
      setStats({ total, newSignups, dau });

      setUsers(usersData || []);
      setUserRoles(rolesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([newRole]);

      if (error) throw error;

      setShowAddRole(false);
      setNewRole({ user_id: '', role: 'user' });
      fetchData();
    } catch (err) {
      console.error('Error adding role:', err);
      alert(t('admin.database.roles.addError') + ': ' + err.message);
    }
  };

  const handleUpdateRole = async (roleId, newRoleValue) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRoleValue, updated_at: new Date().toISOString() })
        .eq('id', roleId);

      if (error) throw error;

      setEditingRole(null);
      fetchData();
    } catch (err) {
      console.error('Error updating role:', err);
      alert(t('admin.database.roles.updateError') + ': ' + err.message);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      fetchData();
    } catch (err) {
      console.error('Error deleting role:', err);
      alert(t('admin.database.roles.deleteError') + ': ' + err.message);
    }
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.email || 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name' : 'Unknown';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.database.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.database.subtitle')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">{t('admin.database.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.database.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.database.subtitle')}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
          <button 
            onClick={fetchData}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filtered users by search
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    getUserName(u.id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Database className="mr-2" />
          {t('admin.database.title')}
        </h1>
         {/*
          <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.database.subtitle')}
        </p>
        */}
       
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm w-full">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">User & Role Management</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Assign, update, and remove roles with real-time updates.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm w-full">
            <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Advanced Analytics</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Track user growth, daily activity, and new signups.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm w-full">
            <Save className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Secure Data Export</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Export user data to CSV for audits and reports.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-sm w-full">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Access Monitoring</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Monitor permissions and user access levels.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg shadow-sm w-full">
            <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-1" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Live Activity Tracking</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">View and filter recent user activities instantly.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm w-full">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Audit & Security</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Search, filter, and audit user activity for compliance.</div>
            </div>
          </div>
        </div>
      </div>
       {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-xs text-gray-500 mb-1">New Signups (7d)</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.newSignups}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-xs text-gray-500 mb-1">Daily Active (DAU)</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.dau}</div>
        </div>
      </div>
    

      {/* Users Table + Export */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">User Growth Analytics</h1>
        <button
          onClick={exportUsersCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow transition-colors"
        >
          Export CSV
        </button>
      </div>
      {/* Advanced Analytics: User Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth (Last 14 Days)</h2>
        <div className="h-64">
          <Line
            data={getUserGrowthData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
              },
              animation: { duration: 1500, easing: 'easeInOutQuart' }
            }}
          />
        </div>
      </div>

     
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('admin.database.users.title')} ({filteredUsers.length})
              </h3>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white ml-4"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 200 }}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last signed in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Role</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => {
                  const userRole = userRoles.find(r => r.user_id === user.id);
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{getUserName(user.id)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userRole ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userRole.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : userRole.role === 'admin'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}>
                            {userRole.role}
                          </span>
                        ) : (
                          <span className="text-red-500 text-sm">No role assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Roles Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                User Roles ({userRoles.length})
              </h3>
            </div>
            <button
              onClick={() => setShowAddRole(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </button>
          </div>

          {/* Add Role Form */}
          {showAddRole && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <select
                  value={newRole.user_id}
                  onChange={(e) => setNewRole({ ...newRole, user_id: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} - {getUserName(user.id)}
                    </option>
                  ))}
                </select>
                <select
                  value={newRole.role}
                  onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddRole}
                  disabled={!newRole.user_id}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={() => setShowAddRole(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {userRoles.map((roleEntry) => (
                  <tr key={roleEntry.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getUserEmail(roleEntry.user_id)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getUserName(roleEntry.user_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingRole === roleEntry.id ? (
                        <select
                          defaultValue={roleEntry.role}
                          onChange={(e) => handleUpdateRole(roleEntry.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                        >
                          {roleOptions.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          roleEntry.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : roleEntry.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {roleEntry.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(roleEntry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {editingRole === roleEntry.id ? (
                        <button
                          onClick={() => setEditingRole(null)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingRole(roleEntry.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(roleEntry.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {userRoles.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No user roles found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Add roles to users to manage access permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDatabasePanel;