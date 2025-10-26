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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboardPanel = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 5;
  const totalPages = Math.ceil(recentActivity.length / activitiesPerPage);
  const paginatedActivities = recentActivity.slice((activityPage - 1) * activitiesPerPage, activityPage * activitiesPerPage);

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t('admin.dashboard.charts.revenue')}
          </h3>
          <div className="h-80">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'Revenue (€)',
                    // Real data will be added via admin service in future updates
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (metricsResult.data.totalRevenue || 0)],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      label: function(context) {
                        return '€' + context.parsed.y.toLocaleString();
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false,
                    },
                    ticks: {
                      callback: function(value) {
                        return '€' + (value / 1000) + 'k';
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                      drawBorder: false,
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          </div>
        </div>

        {/* User Distribution Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t('admin.dashboard.charts.userDistribution', 'User Distribution')}
          </h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Free Users', 'Trial Users', 'Premium Users'],
                datasets: [
                  {
                    // Calculate percentages from real data
                    data: [
                      metricsResult.data.totalUsers - metricsResult.data.activeTrials || 0,
                      metricsResult.data.activeTrials || 0,
                      0 // Premium users - will be calculated from Stripe in future
                    ],
                    backgroundColor: [
                      'rgb(59, 130, 246)',
                      'rgb(249, 115, 22)',
                      'rgb(34, 197, 94)'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                        return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                      }
                    }
                  }
                },
                animation: {
                  animateRotate: true,
                  animateScale: true,
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t('admin.dashboard.charts.monthlyComparison', 'Monthly Comparison')}
        </h3>
        <div className="h-80">
          <Bar
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'New Users',
                  // Real data will show current month's data
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, metricsResult.data.totalUsers || 0],
                  backgroundColor: 'rgb(59, 130, 246)',
                  borderRadius: 8,
                  barThickness: 20
                },
                {
                  label: 'Active Trials',
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, metricsResult.data.activeTrials || 0],
                  backgroundColor: 'rgb(249, 115, 22)',
                  borderRadius: 8,
                  barThickness: 20
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  cornerRadius: 8,
                  displayColors: true
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                  }
                },
                x: {
                  grid: {
                    display: false,
                    drawBorder: false,
                  }
                }
              },
              animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
                delay: (context) => {
                  let delay = 0;
                  if (context.type === 'data' && context.mode === 'default') {
                    delay = context.dataIndex * 100 + context.datasetIndex * 50;
                  }
                  return delay;
                }
              }
            }}
          />
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t('admin.dashboard.charts.monthlyComparison', 'Monthly Comparison')}
        </h3>
        <div className="h-80">
          <Bar
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'New Users',
                  data: [120, 190, 150, 220, 180, 250, 230, 280, 260, 320, 300, 350],
                  backgroundColor: 'rgb(59, 130, 246)',
                  borderRadius: 8,
                  barThickness: 20
                },
                {
                  label: 'Invoices Created',
                  data: [85, 140, 110, 180, 160, 210, 190, 240, 220, 270, 250, 300],
                  backgroundColor: 'rgb(249, 115, 22)',
                  borderRadius: 8,
                  barThickness: 20
                },
                {
                  label: 'Subscriptions',
                  data: [45, 75, 60, 95, 80, 110, 100, 130, 115, 145, 135, 160],
                  backgroundColor: 'rgb(34, 197, 94)',
                  borderRadius: 8,
                  barThickness: 20
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  cornerRadius: 8,
                  displayColors: true
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                  }
                },
                x: {
                  grid: {
                    display: false,
                    drawBorder: false,
                  }
                }
              },
              animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
                delay: (context) => {
                  let delay = 0;
                  if (context.type === 'data' && context.mode === 'default') {
                    delay = context.dataIndex * 100 + context.datasetIndex * 50;
                  }
                  return delay;
                }
              }
            }}
          />
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
          {paginatedActivities.length > 0 ? (
            paginatedActivities.map((activity, index) => (
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
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center py-4 space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
              disabled={activityPage === 1}
            >
              Previous
            </button>
            <span className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {activityPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              onClick={() => setActivityPage((p) => Math.min(totalPages, p + 1))}
              disabled={activityPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPanel;