import { useEffect, useState } from 'react';
import { Activity, Loader2, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react';

const mockActivities = [
  { id: 1, type: 'Invoice Created', user: 'John Doe', status: 'success', timestamp: new Date().toISOString() },
  { id: 2, type: 'User Login', user: 'Jane Smith', status: 'success', timestamp: new Date().toISOString() },
  { id: 3, type: 'Payment Failed', user: 'Alice Brown', status: 'error', timestamp: new Date().toISOString() },
  { id: 4, type: 'Invoice Deleted', user: 'John Doe', status: 'error', timestamp: new Date().toISOString() },
  { id: 5, type: 'Profile Updated', user: 'Jane Smith', status: 'success', timestamp: new Date().toISOString() },
];

const MonitoringPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  const fetchActivities = () => {
    setLoading(true);
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1200);
  };

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter((a) => a.type.toLowerCase().includes(filter));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-bounce" />
          <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">Monitoring</h1>
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <button
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={fetchActivities}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="invoice">Invoice</option>
              <option value="login">Login</option>
              <option value="payment">Payment</option>
              <option value="profile">Profile</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <span className="text-lg text-gray-600 dark:text-gray-400">Loading activities...</span>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No activities found.</div>
        ) : (
          <ul className="space-y-4">
            {filteredActivities.map((activity) => (
              <li key={activity.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center transition-transform hover:scale-[1.02] hover:shadow-lg">
                <div className="flex-shrink-0">
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-500 animate-pulse" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 animate-pulse" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">{activity.type}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">User: {activity.user}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;
