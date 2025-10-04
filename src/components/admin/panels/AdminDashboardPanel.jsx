import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Building2, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Activity,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { adminAnalyticsService } from '../../../services/adminService';

const AdminDashboardPanel = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsResult, activityResult] = await Promise.all([
          adminAnalyticsService.getDashboardMetrics(),
          adminAnalyticsService.getRecentActivity(10)
        ]);

        if (metricsResult.error) {
          throw metricsResult.error;
        }

        if (activityResult.error) {
          throw activityResult.error;
        }

        // Format metrics for display
        const formattedMetrics = [
          {
            title: t('admin.dashboard.metrics.totalUsers'),
            value: metricsResult.data.totalUsers.toLocaleString(),
            change: '+12%', // Could calculate actual change with historical data
            trend: 'up',
            icon: Users,
            color: 'blue'
          },
          {
            title: t('admin.dashboard.metrics.totalCustomers', 'Total Customers'),
            value: metricsResult.data.totalCustomers.toLocaleString(),
            change: '+8%',
            trend: 'up',
            icon: Building2,
            color: 'green'
          },
          {
            title: t('admin.dashboard.metrics.activeTrials'),
            value: metricsResult.data.activeTrials.toLocaleString(),
            change: metricsResult.data.activeTrials > 50 ? '+5%' : '-5%',
            trend: metricsResult.data.activeTrials > 50 ? 'up' : 'down',
            icon: CreditCard,
            color: 'orange'
          },
          {
            title: t('admin.dashboard.metrics.totalRevenue', 'Total Revenue'),
            value: `$${metricsResult.data.totalRevenue.toLocaleString()}`,
            change: '+18%',
            trend: 'up',
            icon: DollarSign,
            color: 'purple'
          }
        ];

        setMetrics(formattedMetrics);
        setRecentActivity(activityResult.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'signup': return <Users size={16} className="text-green-500" />;
      case 'trial_started': return <CreditCard size={16} className="text-blue-500" />;
      case 'subscription': return <DollarSign size={16} className="text-purple-500" />;
      case 'invoice_created': return <FileText size={16} className="text-orange-500" />;
      case 'estimate_created': return <FileText size={16} className="text-blue-500" />;
      case 'support_ticket': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.dashboard.subtitle')}
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
            {t('admin.dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.dashboard.subtitle')}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics?.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp 
                      size={16} 
                      className={`mr-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
                    />
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      {t('admin.dashboard.metrics.vs_last_month')}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${metric.color}-100 dark:bg-${metric.color}-900`}>
                  <Icon size={24} className={`text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.dashboard.charts.revenue')}
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.dashboard.charts.placeholder')}
            </p>
          </div>
        </div>

        {/* Conversion Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.dashboard.charts.conversion')}
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.dashboard.charts.placeholder')}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.dashboard.activity.title')}
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="p-6 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.details || t(`admin.dashboard.activity.types.${activity.type}`)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.user} • {activity.email}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(activity.time)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {t('admin.dashboard.activity.noActivity', 'No recent activity')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPanel;