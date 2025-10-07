import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  FileText,
  Receipt,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import FrenchInvoiceCTA from "../components/FrenchInvoiceCTA";
import { supabase } from "@/integrations/supabase/client";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    outstanding: 0,
    thisMonth: 0,
    revenueData: [],
    statusData: { paid: 0, pending: 0, overdue: 0, draft: 0 },
    monthlyData: [],
    recentInvoices: [],
    customers: 0,
    estimates: 0,
    receipts: 0
  });

  // Handle navigation with scroll to top
  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get user display name from metadata or email
  const getUserDisplayName = () => {
    if (!user) return 'User';
    const metadata = user.user_metadata;
    if (metadata?.first_name && metadata?.last_name) {
      return `${metadata.first_name} ${metadata.last_name}`;
    }
    if (metadata?.full_name) {
      return metadata.full_name;
    }
    if (metadata?.name) {
      return metadata.name;
    }
    // Fallback to email username
    return user.email?.split('@')[0] || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const displayName = getUserDisplayName();
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning', 'Good morning');
    if (hour < 17) return t('dashboard.greeting.afternoon', 'Good afternoon');
    return t('dashboard.greeting.evening', 'Good evening');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id);

        // Fetch estimates
        const { data: estimates, error: estimatesError } = await supabase
          .from('estimates')
          .select('*')
          .eq('user_id', user.id);

        // Fetch receipts
        const { data: receipts, error: receiptsError } = await supabase
          .from('receipts')
          .select('*')
          .eq('user_id', user.id);

        // Fetch customers
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id);

        if (invoicesError) throw invoicesError;
        if (estimatesError) throw estimatesError;
        if (receiptsError) throw receiptsError;
        if (customersError) throw customersError;

        // Calculate statistics
        const totalInvoices = invoices?.length || 0;
        const totalRevenue = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0) || 0;
        const outstanding = invoices?.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length || 0;
        
        // Calculate this month's revenue
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = invoices?.filter(inv => new Date(inv.date) >= thisMonthStart)
          .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0) || 0;

        // Status breakdown
        const statusData = {
          paid: invoices?.filter(inv => inv.status === 'paid').length || 0,
          pending: invoices?.filter(inv => inv.status === 'pending').length || 0,
          overdue: invoices?.filter(inv => inv.status === 'overdue').length || 0,
          draft: invoices?.filter(inv => inv.status === 'draft').length || 0
        };

        // Revenue by month (last 12 months)
        const revenueData = [];
        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthInvoices = invoices?.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getMonth() === date.getMonth() && 
                   invDate.getFullYear() === date.getFullYear();
          }) || [];
          
          const monthRevenue = monthInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
          revenueData.push(monthRevenue);
          
          monthlyData.push({
            invoices: monthInvoices.length,
            estimates: estimates?.filter(est => {
              const estDate = new Date(est.date);
              return estDate.getMonth() === date.getMonth() && 
                     estDate.getFullYear() === date.getFullYear();
            }).length || 0,
            receipts: receipts?.filter(rec => {
              const recDate = new Date(rec.date);
              return recDate.getMonth() === date.getMonth() && 
                     recDate.getFullYear() === date.getFullYear();
            }).length || 0
          });
        }

        // Recent invoices
        const recentInvoices = (invoices || [])
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(inv => ({
            id: inv.id,
            number: inv.invoice_number,
            customer: customers?.find(c => c.id === inv.customer_id)?.name || 'N/A',
            date: new Date(inv.date).toLocaleDateString(),
            dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A',
            amount: `$${parseFloat(inv.total || 0).toFixed(2)}`,
            status: inv.status || 'draft',
            priority: inv.status === 'overdue' ? 'high' : inv.status === 'pending' ? 'medium' : 'low'
          }));

        setDashboardData({
          totalInvoices,
          totalRevenue,
          outstanding,
          thisMonth,
          revenueData,
          statusData,
          monthlyData,
          recentInvoices,
          customers: customers?.length || 0,
          estimates: estimates?.length || 0,
          receipts: receipts?.length || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const stats = [
    {
      title: t('dashboard.stats.totalInvoices'),
      value: dashboardData.totalInvoices.toString(),
      icon: FileText,
      change: "+12%",
      trend: "up",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: t('dashboard.stats.totalRevenue'),
      value: `$${dashboardData.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: "+18%",
      trend: "up",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: t('dashboard.stats.outstanding'),
      value: dashboardData.outstanding.toString(),
      icon: TrendingUp,
      change: "-5%",
      trend: "down",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: t('dashboard.stats.thisMonth'),
      value: `$${dashboardData.thisMonth.toFixed(2)}`,
      icon: Calendar,
      change: "+25%",
      trend: "up",
      color: "from-purple-500 to-pink-500",
    },
  ];

  // Revenue Chart Data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: dashboardData.revenueData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
        pointHoverBorderWidth: 3,
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Revenue: $${context.parsed.y.toFixed(2)}`
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
          callback: (value) => `$${value}`
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
    }
  };

  // Status Doughnut Chart
  const statusChartData = {
    labels: ['Paid', 'Pending', 'Overdue', 'Draft'],
    datasets: [
      {
        data: [
          dashboardData.statusData.paid,
          dashboardData.statusData.pending,
          dashboardData.statusData.overdue,
          dashboardData.statusData.draft
        ],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 0,
        hoverOffset: 15,
        spacing: 2,
      }
    ]
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart',
    }
  };

  // Monthly Activity Bar Chart
  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Invoices',
        data: dashboardData.monthlyData.map(m => m.invoices),
        backgroundColor: 'rgb(59, 130, 246)',
        borderRadius: 8,
        barThickness: 18
      },
      {
        label: 'Estimates',
        data: dashboardData.monthlyData.map(m => m.estimates),
        backgroundColor: 'rgb(249, 115, 22)',
        borderRadius: 8,
        barThickness: 18
      },
      {
        label: 'Receipts',
        data: dashboardData.monthlyData.map(m => m.receipts),
        backgroundColor: 'rgb(34, 197, 94)',
        borderRadius: 8,
        barThickness: 18
      }
    ]
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: { size: 12, weight: '600' },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          precision: 0
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce delay-1000"></div>
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Header Section */}
        <div className="mb-8">
          {/* Personalized Greeting */}
          {user ? (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-4 border-white/20">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                    <AvatarFallback className="text-xl font-bold bg-white/20 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {getTimeBasedGreeting()}, {getUserDisplayName()}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg">
                      {t('dashboard.welcome.message', 'Welcome to your SwiftFacture dashboard')}
                    </p>
                  </div>
                </div>

                {/* Quick intro */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {t('dashboard.welcome.features.invoices.title', 'Create Invoices')}
                      </p>
                      <p className="text-sm text-blue-100">
                        {t('dashboard.welcome.features.invoices.description', 'Professional invoicing made simple')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {t('dashboard.welcome.features.tracking.title', 'Track Progress')}
                      </p>
                      <p className="text-sm text-blue-100">
                        {t('dashboard.welcome.features.tracking.description', 'Monitor your business performance')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {t('dashboard.welcome.features.payments.title', 'Get Paid Faster')}
                      </p>
                      <p className="text-sm text-blue-100">
                        {t('dashboard.welcome.features.payments.description', 'Streamline your payment process')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleNavigation("/invoice")}
                    className="gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-4 w-4" />
                    {t('dashboard.buttons.newInvoice', 'Create Invoice')}
                  </Button>
                  <Button
                    onClick={() => handleNavigation("/receipt")}
                    variant="outline"
                    className="gap-2 border-white/30 text-orange-600 hover:bg-white/10 backdrop-blur-sm"
                  >
                    <Receipt className="h-4 w-4" />
                    {t('dashboard.buttons.createReceipt', 'Create Receipt')}
                  </Button>
                  <Button
                    onClick={() => handleNavigation("/customers")}
                    variant="outline"
                    className="gap-2 border-white/30 text-orange-600 hover:bg-white/10 backdrop-blur-sm"
                  >
                    <Users className="h-4 w-4" />
                    {t('dashboard.buttons.manageCustomers', 'Manage Customers')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced experience for non-logged users */
            <div className="mb-8">
              {/* Hero Section for Guest Users */}
              <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white mb-8 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full -translate-x-32 -translate-y-32"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                      {t('dashboard.guest.hero.title', 'Professional Invoicing Made Simple')}
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
                      {t('dashboard.guest.hero.subtitle', 'Create beautiful invoices, track payments, and manage your business with SwiftFacture')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button
                        onClick={() => handleNavigation("/login")}
                        size="lg"
                        className="gap-3 bg-white text-blue-900 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-4 rounded-xl font-semibold"
                      >
                        <Sparkles className="h-5 w-5" />
                        {t('dashboard.guest.buttons.getStarted', 'Get Started Free')}
                      </Button>
                      <Button
                        onClick={() => handleNavigation("/about")}
                        variant="outline"
                        size="lg"
                        className="gap-3 border-white/30 text-orange-600 hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 rounded-xl font-semibold"
                      >
                        <Target className="h-5 w-5" />
                        {t('dashboard.guest.buttons.learnMore', 'Learn More')}
                      </Button>
                    </div>
                  </div>

                  {/* Feature Preview Cards */}
                  <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                          <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold">
                          {t('dashboard.guest.features.invoicing.title', 'Smart Invoicing')}
                        </h3>
                      </div>
                      <p className="text-blue-100 leading-relaxed">
                        {t('dashboard.guest.features.invoicing.description', 'Create professional invoices in minutes with our beautiful templates and smart automation')}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                          <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold">
                          {t('dashboard.guest.features.customers.title', 'Customer Management')}
                        </h3>
                      </div>
                      <p className="text-blue-100 leading-relaxed">
                        {t('dashboard.guest.features.customers.description', 'Keep track of all your clients, their contact details, and payment history in one place')}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold">
                          {t('dashboard.guest.features.analytics.title', 'Business Insights')}
                        </h3>
                      </div>
                      <p className="text-blue-100 leading-relaxed">
                        {t('dashboard.guest.features.analytics.description', 'Track your revenue, monitor payment status, and get insights to grow your business')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section - Login Encouragement */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-900 text-xl">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      {t('dashboard.guest.benefits.productivity.title', 'Boost Your Productivity')}
                    </CardTitle>
                    <CardDescription className="text-blue-700 text-base">
                      {t('dashboard.guest.benefits.productivity.subtitle', 'Sign up to unlock powerful features that save you hours every week')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-blue-900">
                          {t('dashboard.guest.benefits.productivity.feature1', 'Save Customer Information')}
                        </p>
                        <p className="text-sm text-blue-700">
                          {t('dashboard.guest.benefits.productivity.feature1Desc', 'Never type client details again with our customer database')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-blue-900">
                          {t('dashboard.guest.benefits.productivity.feature2', 'Template Library')}
                        </p>
                        <p className="text-sm text-blue-700">
                          {t('dashboard.guest.benefits.productivity.feature2Desc', 'Access professional invoice templates for every industry')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-blue-900">
                          {t('dashboard.guest.benefits.productivity.feature3', 'Payment Tracking')}
                        </p>
                        <p className="text-sm text-blue-700">
                          {t('dashboard.guest.benefits.productivity.feature3Desc', 'Monitor which invoices are paid, pending, or overdue')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleNavigation("/login")}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      {t('dashboard.guest.benefits.productivity.cta', 'Sign Up to Save Time')}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-900 text-xl">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      {t('dashboard.guest.benefits.business.title', 'Grow Your Business')}
                    </CardTitle>
                    <CardDescription className="text-green-700 text-base">
                      {t('dashboard.guest.benefits.business.subtitle', 'Professional tools to help you get paid faster and look more credible')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-green-900">
                          {t('dashboard.guest.benefits.business.feature1', 'Professional Branding')}
                        </p>
                        <p className="text-sm text-green-700">
                          {t('dashboard.guest.benefits.business.feature1Desc', 'Add your logo and brand colors to every invoice')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-green-900">
                          {t('dashboard.guest.benefits.business.feature2', 'Revenue Analytics')}
                        </p>
                        <p className="text-sm text-green-700">
                          {t('dashboard.guest.benefits.business.feature2Desc', 'See your income trends and identify your best clients')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-green-900">
                          {t('dashboard.guest.benefits.business.feature3', 'Multi-language Support')}
                        </p>
                        <p className="text-sm text-green-700">
                          {t('dashboard.guest.benefits.business.feature3Desc', 'Create invoices in French and English for global clients')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleNavigation("/login")}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    >
                      {t('dashboard.guest.benefits.business.cta', 'Start Growing Today')}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Try Section */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mb-8">
                <CardContent className="p-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-purple-900 mb-4">
                      {t('dashboard.guest.tryNow.title', 'Want to Try Before You Sign Up?')}
                    </h2>
                    <p className="text-purple-700 mb-6 max-w-2xl mx-auto">
                      {t('dashboard.guest.tryNow.description', 'Explore our invoice templates and create a sample invoice to see how easy it is')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => handleNavigation("/invoice")}
                        variant="outline"
                        className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <FileText className="h-4 w-4" />
                        {t('dashboard.guest.tryNow.tryInvoice', 'Try Creating Invoice')}
                      </Button>
                      <Button
                        onClick={() => handleNavigation("/receipt")}
                        variant="outline"
                        className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <Receipt className="h-4 w-4" />
                        {t('dashboard.guest.tryNow.tryReceipt', 'Try Creating Receipt')}
                      </Button>
                    </div>
                    <p className="text-sm text-purple-600 mt-4">
                      {t('dashboard.guest.tryNow.note', 'Sign up to save your work and access all features')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions Section for logged-in users */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('dashboard.quickActions.title', 'Quick Actions')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card 
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleNavigation("/invoice")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">
                        {t('dashboard.quickActions.newInvoice.title', 'New Invoice')}
                      </p>
                      <p className="text-sm text-blue-700">
                        {t('dashboard.quickActions.newInvoice.description', 'Create professional invoices')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleNavigation("/estimate")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">
                        {t('dashboard.quickActions.newEstimate.title', 'New Estimate')}
                      </p>
                      <p className="text-sm text-green-700">
                        {t('dashboard.quickActions.newEstimate.description', 'Send project estimates')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleNavigation("/customers")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900">
                        {t('dashboard.quickActions.addCustomer.title', 'Add Customer')}
                      </p>
                      <p className="text-sm text-purple-700">
                        {t('dashboard.quickActions.addCustomer.description', 'Manage client information')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleNavigation("/receipt")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Receipt className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900">
                        {t('dashboard.quickActions.newReceipt.title', 'New Receipt')}
                      </p>
                      <p className="text-sm text-orange-700">
                        {t('dashboard.quickActions.newReceipt.description', 'Generate payment receipts')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Stats Grid with Animations - Only for logged in users */}
        {user && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('dashboard.stats.title', 'Your Business Overview')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-2">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-500"
                    }`}>
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          </div>
        )}

        {/* Charts & Main Content - Only for logged in users */}
        {user && (
          <div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="xl:col-span-2 bg-white/80 backdrop-blur-sm border-gray-200/50 elegant-shadow hover:shadow-xl transition-smooth animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                {t('dashboard.charts.revenueOverview', 'Revenue Overview')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.charts.revenueDescription', 'Monthly revenue trends over the last 12 months')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <Line data={revenueChartData} options={revenueChartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Status Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 elegant-shadow hover:shadow-xl transition-smooth animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                {t('dashboard.charts.invoiceStatus', 'Invoice Status')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.charts.invoiceStatusDescription', 'Distribution of invoice statuses')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center">
                <div className="w-full max-w-[240px]">
                  <Doughnut data={statusChartData} options={statusChartOptions} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Activity Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 elegant-shadow hover:shadow-xl transition-smooth animate-fade-in mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              {t('dashboard.charts.monthlyActivity', 'Monthly Activity')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.charts.monthlyActivityDescription', 'Invoices, estimates, and receipts created per month')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <Bar data={monthlyChartData} options={monthlyChartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 elegant-shadow hover:shadow-xl transition-smooth animate-fade-in hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-blue-900">{dashboardData.customers}</p>
                </div>
                <div className="p-4 bg-blue-600 rounded-xl shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 elegant-shadow hover:shadow-xl transition-smooth animate-fade-in hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium mb-1">Total Estimates</p>
                  <p className="text-3xl font-bold text-orange-900">{dashboardData.estimates}</p>
                </div>
                <div className="p-4 bg-orange-600 rounded-xl shadow-lg">
                  <FileText className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 elegant-shadow hover:shadow-xl transition-smooth animate-fade-in hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium mb-1">Total Receipts</p>
                  <p className="text-3xl font-bold text-green-900">{dashboardData.receipts}</p>
                </div>
                <div className="p-4 bg-green-600 rounded-xl shadow-lg">
                  <Receipt className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>{t('dashboard.invoices.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard.invoices.description')}
                    </CardDescription>
                  </div>
                    <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {dashboardData.recentInvoices.length} {t('dashboard.invoices.freeMonthly', 'invoices')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <TabsList className="grid w-full lg:w-auto grid-cols-4 bg-muted/50 p-1">
                      <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t('dashboard.invoices.tabs.all', 'All')} ({dashboardData.recentInvoices.length})
                      </TabsTrigger>
                      <TabsTrigger value="outstanding" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t('dashboard.invoices.tabs.outstanding', 'Outstanding')} ({dashboardData.outstanding})
                      </TabsTrigger>
                      <TabsTrigger value="drafts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t('dashboard.invoices.tabs.drafts', 'Drafts')} ({dashboardData.statusData.draft})
                      </TabsTrigger>
                      <TabsTrigger value="more" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t('dashboard.invoices.tabs.more')}
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2 w-full lg:w-auto">
                      <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder={t('dashboard.invoices.search')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <TabsContent value="all" className="space-y-4">
                    <div className="border border-gray-200/50 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-gradient-to-r from-gray-50 to-gray-100/30 border-b">
                        <div className="col-span-3">{t('dashboard.invoices.columns.invoice')}</div>
                        <div className="col-span-3">{t('dashboard.invoices.columns.customer')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.dueDate')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.amount')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.status')}</div>
                      </div>

                      {/* Table Rows */}
                      <div className="divide-y divide-gray-200/30">
                        {dashboardData.recentInvoices.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">{t('dashboard.invoices.noInvoices', 'No invoices yet. Create your first one!')}</p>
                          </div>
                        ) : (
                          dashboardData.recentInvoices.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group animate-fade-in"
                            >
                              <div className="col-span-3 font-medium text-sm">
                                {invoice.number}
                              </div>
                              <div className="col-span-3 text-sm">
                                {invoice.customer}
                              </div>
                              <div className="col-span-2 text-sm text-muted-foreground">
                                {invoice.dueDate}
                              </div>
                              <div className="col-span-2 font-medium text-sm">
                                {invoice.amount}
                              </div>
                              <div className="col-span-2">
                                <Badge
                                  variant={
                                    invoice.status === "paid"
                                      ? "default"
                                      : invoice.status === "overdue"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className={`
                                    ${invoice.status === "paid" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                                    ${invoice.status === "pending" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}
                                    ${invoice.status === "overdue" ? "bg-red-100 text-red-700 hover:bg-red-200" : ""}
                                    ${invoice.status === "draft" ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : ""}
                                  `}
                                >
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                                    ? "default"
                                    : invoice.status === "Overdue"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={`text-xs ${
                                  invoice.status === "Paid" 
                                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                    : invoice.status === "Overdue"
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                }`}
                              >
                                {invoice.status === "Paid" 
                                  ? t('dashboard.charts.statuses.paid')
                                  : invoice.status === "Overdue"
                                  ? t('dashboard.charts.statuses.overdue')
                                  : t('dashboard.charts.statuses.pending')
                                }
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  {t('dashboard.quickActions.title', 'Quick Actions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: FileText, label: t('dashboard.quickActions.createInvoice', 'Create Invoice'), action: () => handleNavigation("/invoice") },
                  { icon: Receipt, label: t('dashboard.quickActions.generateReceipt', 'Generate Receipt'), action: () => handleNavigation("/receipt") },
                  { icon: Users, label: t('dashboard.quickActions.manageCustomers', 'Manage Customers'), action: () => handleNavigation("/customers") },
                  { icon: Download, label: t('dashboard.quickActions.exportReports', 'Export Reports'), action: () => {} },
                ].map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.action}
                    className="w-full justify-start gap-3 bg-white hover:bg-gray-50 border border-gray-200/50 hover:border-gray-300 transition-all duration-200 hover:scale-105"
                    variant="outline"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  {t('dashboard.recentActivity.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: t('dashboard.recentActivity.invoicePaid'), details: "INV-1001 - Acme Corp", time: t('dashboard.recentActivity.timeAgo.hoursAgo', { count: 2 }) },
                  { action: t('dashboard.recentActivity.newInvoiceCreated'), details: "INV-1005 - Tech Startup", time: t('dashboard.recentActivity.timeAgo.hoursAgo', { count: 5 }) },
                  { action: t('dashboard.recentActivity.receiptGenerated'), details: "RC-0456 - Retail Client", time: t('dashboard.recentActivity.timeAgo.dayAgo', { count: 1 }) },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.action}</div>
                      <div className="text-muted-foreground text-xs">{activity.details}</div>
                      <div className="text-muted-foreground text-xs mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
            </div>
          </div>
        )}
        
        {/* Getting Started Tips for New Users */}
        {user && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="h-5 w-5" />
                {t('dashboard.gettingStarted.title', 'Getting Started with SwiftFacture')}
              </CardTitle>
              <CardDescription className="text-indigo-700">
                {t('dashboard.gettingStarted.subtitle', 'Here are some tips to help you get the most out of your invoicing experience')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">
                        {t('dashboard.tips.step1.title', 'Add Your First Customer')}
                      </h4>
                      <p className="text-sm text-indigo-700">
                        {t('dashboard.tips.step1.description', 'Start by adding customer information to make invoicing faster')}
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-indigo-600 p-0 h-auto"
                        onClick={() => handleNavigation("/customers")}
                      >
                        {t('dashboard.tips.step1.action', 'Add Customer →')}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">
                        {t('dashboard.tips.step2.title', 'Create Your First Invoice')}
                      </h4>
                      <p className="text-sm text-indigo-700">
                        {t('dashboard.tips.step2.description', 'Choose from our professional templates and customize as needed')}
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-indigo-600 p-0 h-auto"
                        onClick={() => handleNavigation("/invoice")}
                      >
                        {t('dashboard.tips.step2.action', 'Create Invoice →')}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">
                        {t('dashboard.tips.step3.title', 'Track Your Business')}
                      </h4>
                      <p className="text-sm text-indigo-700">
                        {t('dashboard.tips.step3.description', 'Monitor your revenue and payment status from this dashboard')}
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-indigo-600 p-0 h-auto"
                        onClick={() => handleNavigation("/premium")}
                      >
                        {t('dashboard.tips.step3.action', 'Learn More →')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-indigo-900">
                      {t('dashboard.tips.proTip.title', 'Pro Tip')}
                    </h4>
                    <p className="text-sm text-indigo-700">
                      {t('dashboard.tips.proTip.description', 'Save time by creating invoice templates for recurring clients and services')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleNavigation("/template")}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {t('dashboard.tips.proTip.action', 'Explore Templates')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customizable Invoice CTA */}
        <FrenchInvoiceCTA />
      </main>
    </div>
  );
};

export default Dashboard;