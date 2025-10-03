import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const DebugAuth = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

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
                </div>
              </div>

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