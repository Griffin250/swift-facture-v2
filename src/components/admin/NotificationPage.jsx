import { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Example: Fetch notifications from a 'notifications' table
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-bounce" />
          <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <span className="text-lg text-gray-600 dark:text-gray-400">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 flex flex-col items-center">
            <span className="text-red-700 dark:text-red-400 mb-2">{error}</span>
            <button onClick={fetchNotifications} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">Retry</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No notifications yet.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li key={notif.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center transition-transform hover:scale-[1.02] hover:shadow-lg">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-pulse" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">{notif.title || 'Notification'}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{notif.message}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
