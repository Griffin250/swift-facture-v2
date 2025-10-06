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
import { supabase } from '../../../integrations/supabase/client';
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
  const [chartData, setChartData] = useState({
    revenue: [],
    userDistribution: [],
    monthlyStats: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsResult, activityResult, invoicesData, estimatesData, receiptsData] = await Promise.all([
          adminAnalyticsService.getDashboardMetrics(),
          adminAnalyticsService.getRecentActivity(10),
          supabase.from('invoices').select('total, created_at, status'),
          supabase.from('estimates').select('created_at'),
          supabase.from('receipts').select('created_at')
        ]);

        if (metricsResult.error) {
          throw metricsResult.error;
        }

        if (activityResult.error) {
          throw activityResult.error;
        }

        // Process revenue data by month
        const revenueByMonth = {};
        const currentYear = new Date().getFullYear();
        
        // Initialize all months with 0
        for (let i = 0; i < 12; i++) {
          const monthName = new Date(currentYear, i, 1).toLocaleDateString('en', { month: 'short' });
          revenueByMonth[monthName] = 0;
        }

        // Aggregate revenue by month
        invoicesData.data?.forEach(invoice => {
          const date = new Date(invoice.created_at);
          if (date.getFullYear() === currentYear) {
            const monthName = date.toLocaleDateString('en', { month: 'short' });
            revenueByMonth[monthName] += parseFloat(invoice.total || 0);
          }
        });

        // Process monthly statistics
        const monthlyStats = {};
        for (let i = 0; i < 12; i++) {
          const monthName = new Date(currentYear, i, 1).toLocaleDateString('en', { month: 'short' });
          monthlyStats[monthName] = { invoices: 0, estimates: 0, receipts: 0 };
        }

        invoicesData.data?.forEach(item => {
          const date = new Date(item.created_at);
          if (date.getFullYear() === currentYear) {
            const monthName = date.toLocaleDateString('en', { month: 'short' });
            monthlyStats[monthName].invoices++;
          }
        });

        estimatesData.data?.forEach(item => {
          const date = new Date(item.created_at);
          if (date.getFullYear() === currentYear) {
            const monthName = date.toLocaleDateString('en', { month: 'short' });
            monthlyStats[monthName].estimates++;
          }
        });

        receiptsData.data?.forEach(item => {
          const date = new Date(item.created_at);
          if (date.getFullYear() === currentYear) {
            const monthName = date.toLocaleDateString('en', { month: 'short' });
            monthlyStats[monthName].receipts++;
          }
        });

        // Calculate user distribution (mock data based on metrics)
        const totalUsers = metricsResult.data.totalUsers;
        const paidUsers = metricsResult.data.paidInvoices || 0;
        const trialUsers = metricsResult.data.activeTrials || 0;
        const freeUsers = Math.max(0, totalUsers - paidUsers - trialUsers);

        setChartData({
          revenue: Object.values(revenueByMonth),
          userDistribution: [
            Math.round((freeUsers / totalUsers) * 100),
            Math.round((trialUsers / totalUsers) * 100),
            Math.round((paidUsers / totalUsers) * 100),
            5 // Enterprise placeholder
          ],
          monthlyStats: Object.keys(monthlyStats).map(month => ({
            month,
            ...monthlyStats[month]
          }))
        });

        // Format metrics for display
        const formattedMetrics = [
          {
            title: t('admin.dashboard.metrics.totalUsers'),
            value: metricsResult.data.totalUsers.toLocaleString(),
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'primary'
          },
          {
            title: t('admin.dashboard.metrics.totalCustomers', 'Total Customers'),
            value: metricsResult.data.totalCustomers.toLocaleString(),
            change: '+8%',
            trend: 'up',
            icon: Building2,
            color: 'secondary'
          },
          {
            title: t('admin.dashboard.metrics.activeTrials'),
            value: metricsResult.data.activeTrials.toLocaleString(),
            change: metricsResult.data.activeTrials > 50 ? '+5%' : '-5%',
            trend: metricsResult.data.activeTrials > 50 ? 'up' : 'down',
            icon: CreditCard,
            color: 'accent'
          },
          {
            title: t('admin.dashboard.metrics.totalRevenue', 'Total Revenue'),
            value: `$${Math.round(metricsResult.data.totalRevenue).toLocaleString()}`,
            change: '+18%',
            trend: 'up',
            icon: DollarSign,
            color: 'primary'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metrics?.map((metric, index) => {
          const Icon = metric.icon;
          const bgColorClass = metric.color === 'primary' ? 'bg-primary/10' : 
                              metric.color === 'secondary' ? 'bg-secondary/10' : 
                              'bg-accent/10';
          const textColorClass = metric.color === 'primary' ? 'text-primary' : 
                                metric.color === 'secondary' ? 'text-secondary' : 
                                'text-accent';
          return (
            <div
              key={index}
              className="bg-card rounded-xl shadow-lg border border-border p-4 md:p-6 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-2">
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp 
                      size={14} 
                      className={`mr-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
                    />
                    <span className={`text-xs md:text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-muted-foreground text-xs ml-1 hidden sm:inline">
                      {t('admin.dashboard.metrics.vs_last_month')}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${bgColorClass}`}>
                  <Icon size={20} className={textColorClass} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Trend Chart - Takes 2 columns on XL screens */}
        <div className="xl:col-span-2 bg-card rounded-xl shadow-lg border border-border p-4 md:p-6 animate-fade-in">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">
            {t('admin.dashboard.charts.revenue')}
          </h3>
          <div className="h-64 md:h-80">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'Revenue ($)',
                    data: chartData.revenue.length > 0 ? chartData.revenue : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'hsl(var(--primary))',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'hsl(var(--primary))',
                    pointBorderColor: 'hsl(var(--card))',
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
                    backgroundColor: 'hsl(var(--popover))',
                    titleColor: 'hsl(var(--popover-foreground))',
                    bodyColor: 'hsl(var(--popover-foreground))',
                    borderColor: 'hsl(var(--border))',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      label: function(context) {
                        return '$' + Math.round(context.parsed.y).toLocaleString();
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'hsl(var(--border) / 0.3)',
                      drawBorder: false,
                    },
                    ticks: {
                      color: 'hsl(var(--muted-foreground))',
                      callback: function(value) {
                        return '$' + (value >= 1000 ? (value / 1000) + 'k' : value);
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      color: 'hsl(var(--muted-foreground))'
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
        <div className="bg-card rounded-xl shadow-lg border border-border p-4 md:p-6 animate-fade-in">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">
            {t('admin.dashboard.charts.userDistribution', 'User Distribution')}
          </h3>
          <div className="h-64 md:h-80 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Free Users', 'Trial Users', 'Premium Users', 'Enterprise'],
                datasets: [
                  {
                    data: chartData.userDistribution.length > 0 ? chartData.userDistribution : [25, 25, 25, 25],
                    backgroundColor: [
                      'hsl(var(--primary))',
                      'hsl(var(--secondary))',
                      'hsl(var(--accent))',
                      'hsl(var(--muted))'
                    ],
                    borderColor: 'hsl(var(--card))',
                    borderWidth: 2,
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
                      padding: 12,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: 'hsl(var(--foreground))',
                      font: {
                        size: 11
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'hsl(var(--popover))',
                    titleColor: 'hsl(var(--popover-foreground))',
                    bodyColor: 'hsl(var(--popover-foreground))',
                    borderColor: 'hsl(var(--border))',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                      label: function(context) {
                        return context.label + ': ' + context.parsed + '%';
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
      <div className="bg-card rounded-xl shadow-lg border border-border p-4 md:p-6 animate-fade-in">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">
          {t('admin.dashboard.charts.monthlyComparison', 'Monthly Activity')}
        </h3>
        <div className="h-64 md:h-80">
          <Bar
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'Invoices',
                  data: chartData.monthlyStats.length > 0 
                    ? chartData.monthlyStats.map(s => s.invoices) 
                    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  backgroundColor: 'hsl(var(--primary))',
                  borderRadius: 6,
                  maxBarThickness: 40
                },
                {
                  label: 'Estimates',
                  data: chartData.monthlyStats.length > 0 
                    ? chartData.monthlyStats.map(s => s.estimates) 
                    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  backgroundColor: 'hsl(var(--secondary))',
                  borderRadius: 6,
                  maxBarThickness: 40
                },
                {
                  label: 'Receipts',
                  data: chartData.monthlyStats.length > 0 
                    ? chartData.monthlyStats.map(s => s.receipts) 
                    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  backgroundColor: 'hsl(var(--accent))',
                  borderRadius: 6,
                  maxBarThickness: 40
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
                    pointStyle: 'circle',
                    color: 'hsl(var(--foreground))'
                  }
                },
                tooltip: {
                  backgroundColor: 'hsl(var(--popover))',
                  titleColor: 'hsl(var(--popover-foreground))',
                  bodyColor: 'hsl(var(--popover-foreground))',
                  borderColor: 'hsl(var(--border))',
                  borderWidth: 1,
                  padding: 12,
                  cornerRadius: 8,
                  displayColors: true
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'hsl(var(--border) / 0.3)',
                    drawBorder: false,
                  },
                  ticks: {
                    color: 'hsl(var(--muted-foreground))',
                    stepSize: 1
                  }
                },
                x: {
                  grid: {
                    display: false,
                    drawBorder: false,
                  },
                  ticks: {
                    color: 'hsl(var(--muted-foreground))'
                  }
                }
              },
              animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
                delay: (context) => {
                  let delay = 0;
                  if (context.type === 'data' && context.mode === 'default') {
                    delay = context.dataIndex * 80 + context.datasetIndex * 40;
                  }
                  return delay;
                }
              }
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl shadow-lg border border-border animate-fade-in">
        <div className="p-4 md:p-6 border-b border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            {t('admin.dashboard.activity.title')}
          </h3>
        </div>
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-foreground truncate">
                    {activity.details || t(`admin.dashboard.activity.types.${activity.type}`)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.user} • {activity.email}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity.time)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 md:p-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {t('admin.dashboard.activity.noActivity', 'No recent activity')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPanel;