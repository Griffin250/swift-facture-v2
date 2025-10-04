import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';

const DebugAuth = () => {
  const { user, loading } = useAuth();
  const { role, isAdmin, isSuperAdmin } = useRole();
  const { t } = useTranslation();
  const [assigningRole, setAssigningRole] = useState(false);

  const assignSuperAdminRole = async () => {
    if (!user) return;
    
    setAssigningRole(true);
    try {
      // Try direct insert first
      let { error } = await supabase
        .from('user_roles')
        .insert([
          { user_id: user.id, role: 'super_admin' }
        ]);

      // If RLS blocks us, try using upsert which might work better
      if (error && error.message.includes('row-level security')) {
        const { error: upsertError } = await supabase
          .from('user_roles')
          .upsert([
            { user_id: user.id, role: 'super_admin' }
          ], { 
            onConflict: 'user_id,role',
            ignoreDuplicates: false 
          });
        error = upsertError;
      }

      // If still failing, try to insert with user role first, then update
      if (error && error.message.includes('row-level security')) {
        // First insert a user role
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: user.id, role: 'user' }]);
        
        if (!userRoleError) {
          // Then update to super_admin
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({ role: 'super_admin' })
            .eq('user_id', user.id);
          error = updateError;
        } else {
          error = userRoleError;
        }
      }

      if (error) {
        console.error('Error assigning role:', error);
        alert(`Error assigning role: ${error.message}\n\nYou may need to:\n1. Apply the database migration\n2. Or manually add your role in Supabase dashboard\n3. Your user ID is: ${user.id}`);
      } else {
        alert('Super admin role assigned successfully! Refresh the page.');
        window.location.reload();
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setAssigningRole(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Authentication Debug Information
            </h1>
            
            <div className="space-y-6">
              {/* User Status */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  User Status
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Authenticated:</strong> {user ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Current Role:</strong> {role || 'No role assigned'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Is Super Admin:</strong> {isSuperAdmin ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* Role Assignment */}
              {user && !isSuperAdmin && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Role Assignment
                  </h2>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                      You don&apos;t have admin access. Click the button below to assign yourself super admin role.
                    </p>
                    <button
                      onClick={assignSuperAdminRole}
                      disabled={assigningRole}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {assigningRole ? 'Assigning...' : 'Assign Super Admin Role'}
                    </button>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                      ⚠️ Only use this for initial setup. This gives full admin access.
                    </p>
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      <p className="font-semibold mb-2">If automatic assignment fails, manually add in Supabase:</p>
                      <p className="font-mono text-xs">
                        Table: user_roles<br/>
                        user_id: {user.id}<br/>
                        role: super_admin
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Access */}
              {user && isSuperAdmin && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Admin Access
                  </h2>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                      ✅ You have super admin access! You can now access the admin dashboard.
                    </p>
                    <a
                      href="/admin"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block"
                    >
                      Go to Admin Dashboard
                    </a>
                  </div>
                </div>
              )}

              {/* User Details */}
              {user && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    User Details
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Session Info */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Session Information
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Current URL:</strong> {window.location.href}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>User Agent:</strong> {navigator.userAgent}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Timestamp:</strong> {new Date().toISOString()}
                  </p>
                </div>
              </div>

              {/* Local Storage */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Local Storage (Supabase)
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(
                      Object.keys(localStorage)
                        .filter(key => key.includes('supabase'))
                        .reduce((obj, key) => {
                          try {
                            obj[key] = JSON.parse(localStorage.getItem(key));
                          } catch {
                            obj[key] = localStorage.getItem(key);
                          }
                          return obj;
                        }, {}),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Debug Actions
                </h2>
                <div className="space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Reload Page
                  </button>
                  <button
                    onClick={() => localStorage.clear()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Clear Local Storage
                  </button>
                  <button
                    onClick={() => {
                      console.log('User:', user);
                      console.log('Loading:', loading);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Log to Console
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;