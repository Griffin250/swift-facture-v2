import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
} from "lucide-react";
import FrenchInvoiceCTA from "../components/FrenchInvoiceCTA";
import { supabase } from "@/integrations/supabase/client";
import { frenchInvoiceService } from "@/services/frenchInvoiceService";
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
  const [statusFilter, setStatusFilter] = useState("all");
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
    recentEstimates: [],
    customers: 0,
    estimates: 0,
    receipts: 0,
    recentActivities: []
  });

  // Handle navigation with scroll to top
  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle invoice status update
  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId)
        .select();

      if (error) throw error;

      // Update local state
      setDashboardData(prev => ({
        ...prev,
        recentInvoices: prev.recentInvoices.map(inv => 
          inv.id === invoiceId ? { ...inv, status: newStatus } : inv
        )
      }));

      // Refresh dashboard data to update charts and stats
      const fetchDashboardData = async () => {
        if (!user) return;
        
        // Re-fetch all data to ensure charts and stats are updated
        window.location.reload(); // Simple solution to refresh all data
      };
      
      setTimeout(fetchDashboardData, 100); // Small delay to ensure DB update is complete
      
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
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

  // Activity helper functions
  const getActivityIcon = (type) => {
    switch (type) {
      case 'invoice_created': return FileText;
      case 'invoice_updated': return FileText;
      case 'invoice_paid': return DollarSign;
      case 'estimate_created': return FileText;
      case 'estimate_updated': return FileText;
      case 'receipt_created': return Receipt;
      case 'receipt_updated': return Receipt;
      case 'customer_created': return Users;
      case 'customer_updated': return Users;
      default: return Calendar;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'invoice_created': return 'text-blue-600 bg-blue-100';
      case 'invoice_updated': return 'text-blue-600 bg-blue-100';
      case 'invoice_paid': return 'text-green-600 bg-green-100';
      case 'estimate_created': return 'text-orange-600 bg-orange-100';
      case 'estimate_updated': return 'text-orange-600 bg-orange-100';
      case 'receipt_created': return 'text-purple-600 bg-purple-100';
      case 'receipt_updated': return 'text-purple-600 bg-purple-100';
      case 'customer_created': return 'text-indigo-600 bg-indigo-100';
      case 'customer_updated': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityLink = (activity) => {
    switch (activity.type) {
      case 'invoice_created':
      case 'invoice_updated':
      case 'invoice_paid':
        return `/invoice`;
      case 'estimate_created':
      case 'estimate_updated':
        return `/estimate`;
      case 'receipt_created':
      case 'receipt_updated':
        return `/receipts`;
      case 'customer_created':
      case 'customer_updated':
        return `/customers`;
      default:
        return null;
    }
  };

  const formatActivityTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('dashboard.recentActivity.timeAgo.justNow', 'Just now');
    if (diffInMinutes < 60) return t('dashboard.recentActivity.timeAgo.minutesAgo', '{{count}} minutes ago', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('dashboard.recentActivity.timeAgo.hoursAgo', '{{count}} hours ago', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('dashboard.recentActivity.timeAgo.daysAgo', '{{count}} days ago', { count: diffInDays });
    
    return activityTime.toLocaleDateString();
  };

  useEffect(() => {
    // Fetch recent activities from all tables
    const fetchRecentActivities = async () => {
      if (!user) return [];

      try {
        const activities = [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Fetch recent invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, invoice_number, customer_id, status, total, created_at, updated_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        // Fetch recent estimates
        const { data: estimates } = await supabase
          .from('estimates')
          .select('id, estimate_number, customer_id, status, total, created_at, updated_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        // Fetch recent receipts
        const { data: receipts } = await supabase
          .from('receipts')
          .select('id, receipt_number, customer_id, total, created_at, updated_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        // Fetch recent customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id, name, email, created_at, updated_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        // Get customer names for lookup
        const { data: allCustomers } = await supabase
          .from('customers')
          .select('id, name')
          .eq('user_id', user.id);

        const customerLookup = {};
        allCustomers?.forEach(customer => {
          customerLookup[customer.id] = customer.name;
        });

        // Process invoices
        invoices?.forEach(invoice => {
          const customerName = customerLookup[invoice.customer_id] || 'Unknown Customer';
          
          activities.push({
            id: `invoice_created_${invoice.id}`,
            type: 'invoice_created',
            title: t('dashboard.recentActivity.invoiceCreated', 'New Invoice Created'),
            description: `${invoice.invoice_number} - ${customerName}`,
            details: `$${parseFloat(invoice.total || 0).toFixed(2)}`,
            timestamp: invoice.created_at,
            link: `/invoice`,
            itemId: invoice.id
          });

          // If invoice was updated significantly after creation, add update activity
          const createdDate = new Date(invoice.created_at);
          const updatedDate = new Date(invoice.updated_at);
          if (updatedDate.getTime() - createdDate.getTime() > 60000) { // More than 1 minute difference
            activities.push({
              id: `invoice_updated_${invoice.id}`,
              type: 'invoice_updated',
              title: t('dashboard.recentActivity.invoiceUpdated', 'Invoice Updated'),
              description: `${invoice.invoice_number} - ${customerName}`,
              details: `Status: ${invoice.status}`,
              timestamp: invoice.updated_at,
              link: `/invoice`,
              itemId: invoice.id
            });
          }

          // Add paid activity for paid invoices
          if (invoice.status === 'paid') {
            activities.push({
              id: `invoice_paid_${invoice.id}`,
              type: 'invoice_paid',
              title: t('dashboard.recentActivity.invoicePaid', 'Invoice Paid'),
              description: `${invoice.invoice_number} - ${customerName}`,
              details: `$${parseFloat(invoice.total || 0).toFixed(2)}`,
              timestamp: invoice.updated_at,
              link: `/invoice`,
              itemId: invoice.id
            });
          }
        });

        // Process estimates
        estimates?.forEach(estimate => {
          const customerName = customerLookup[estimate.customer_id] || 'Unknown Customer';
          
          activities.push({
            id: `estimate_created_${estimate.id}`,
            type: 'estimate_created',
            title: t('dashboard.recentActivity.estimateCreated', 'New Estimate Created'),
            description: `${estimate.estimate_number} - ${customerName}`,
            details: `$${parseFloat(estimate.total || 0).toFixed(2)}`,
            timestamp: estimate.created_at,
            link: `/estimate`,
            itemId: estimate.id
          });
        });

        // Process receipts
        receipts?.forEach(receipt => {
          const customerName = customerLookup[receipt.customer_id] || 'Unknown Customer';
          
          activities.push({
            id: `receipt_created_${receipt.id}`,
            type: 'receipt_created',
            title: t('dashboard.recentActivity.receiptCreated', 'New Receipt Generated'),
            description: `${receipt.receipt_number} - ${customerName}`,
            details: `$${parseFloat(receipt.total || 0).toFixed(2)}`,
            timestamp: receipt.created_at,
            link: `/receipts`,
            itemId: receipt.id
          });
        });

        // Process customers
        customers?.forEach(customer => {
          activities.push({
            id: `customer_created_${customer.id}`,
            type: 'customer_created',
            title: t('dashboard.recentActivity.customerCreated', 'New Customer Added'),
            description: customer.name,
            details: customer.email,
            timestamp: customer.created_at,
            link: `/customers`,
            itemId: customer.id
          });
        });

        // Sort all activities by timestamp (most recent first) and limit to 10
        const sortedActivities = activities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);

        return sortedActivities;
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }
    };

    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch regular invoices
        const { data: regularInvoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id);

        // Fetch French invoices
        const frenchInvoices = await frenchInvoiceService.getAllFrenchInvoices();

        // Combine regular and French invoices
        const invoices = [
          ...(regularInvoices || []),
          ...(frenchInvoices || []).map(frenchInv => ({
            ...frenchInv,
            invoice_type: 'french' // Add a flag to identify French invoices
          }))
        ];

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

        // Revenue by month (all 12 months of current year)
        const revenueData = [];
        const monthlyData = [];
        const currentYear = now.getFullYear();
        
        for (let month = 0; month < 12; month++) {
          const monthInvoices = invoices?.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getMonth() === month && 
                   invDate.getFullYear() === currentYear;
          }) || [];
          
          const monthRevenue = monthInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
          revenueData.push(monthRevenue);
          
          // Count customers created in this month
          const monthCustomers = customers?.filter(cust => {
            const custDate = new Date(cust.created_at);
            return custDate.getMonth() === month && 
                   custDate.getFullYear() === currentYear;
          }).length || 0;

          monthlyData.push({
            invoices: monthInvoices.length,
            estimates: estimates?.filter(est => {
              const estDate = new Date(est.date || est.created_at || est.estimate_date);
              return estDate.getMonth() === month && 
                     estDate.getFullYear() === currentYear;
            }).length || 0,
            receipts: receipts?.filter(rec => {
              const recDate = new Date(rec.date);
              return recDate.getMonth() === month && 
                     recDate.getFullYear() === currentYear;
            }).length || 0,
            customers: monthCustomers
          });
        }

        // Recent invoices
        const recentInvoices = (invoices || [])
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(inv => {
            // Handle French invoices
            if (inv.invoice_type === 'french') {
              const frenchData = inv.notes ? JSON.parse(inv.notes) : {};
              return {
                id: inv.id,
                number: inv.invoice_number,
                customer: frenchData.client?.name || 'N/A',
                date: new Date(inv.date).toLocaleDateString(),
                dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A',
                amount: `€${parseFloat(inv.total || 0).toFixed(2)}`,
                status: inv.status || 'draft',
                priority: inv.status === 'overdue' ? 'high' : inv.status === 'pending' ? 'medium' : 'low',
                type: 'French Invoice'
              };
            }
            
            // Handle regular invoices
            return {
              id: inv.id,
              number: inv.invoice_number,
              customer: customers?.find(c => c.id === inv.customer_id)?.name || 'N/A',
              date: new Date(inv.date).toLocaleDateString(),
              dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A',
              amount: `$${parseFloat(inv.total || 0).toFixed(2)}`,
              status: inv.status || 'draft',
              priority: inv.status === 'overdue' ? 'high' : inv.status === 'pending' ? 'medium' : 'low',
              type: 'Regular Invoice'
            };
          });

        // Recent estimates
  // ...existing code...
        const recentEstimates = (estimates || [])
          .sort((a, b) => {
            const dateA = new Date(a.date || a.created_at || a.estimate_date);
            const dateB = new Date(b.date || b.created_at || b.estimate_date);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(est => ({
            id: est.id,
            number: est.estimate_number || est.number || `EST-${est.id}`,
            customer: customers?.find(c => c.id === est.customer_id)?.name || 'N/A',
            date: new Date(est.date || est.created_at || est.estimate_date).toLocaleDateString(),
            validUntil: est.valid_until ? new Date(est.valid_until).toLocaleDateString() : 'N/A',
            amount: `$${parseFloat(est.total || est.amount || 0).toFixed(2)}`,
            status: est.status || 'draft'
          }));
  // ...existing code...

        // Fetch recent activities
        const recentActivities = await fetchRecentActivities();

        setDashboardData({
          totalInvoices,
          totalRevenue,
          outstanding,
          thisMonth,
          revenueData,
          statusData,
          monthlyData,
          recentInvoices,
          recentEstimates,
          customers: customers?.length || 0,
          estimates: estimates?.length || 0,
          receipts: receipts?.length || 0,
          recentActivities
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, t]);

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

  // Generate all 12 month labels in calendar order
  const generateMonthLabels = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  };

  // Revenue Chart Data
  const revenueChartData = {
    labels: generateMonthLabels(),
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
    labels: generateMonthLabels(),
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
      },
      {
        label: 'Customers',
        data: dashboardData.monthlyData.map(m => m.customers),
        backgroundColor: 'rgb(147, 51, 234)',
        borderRadius: 8,
        barThickness: 18
      }
    ]
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    categoryPercentage: 0.7,  // Controls space between month groups
    barPercentage: 0.8,       // Controls width of individual bars
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

  // Filter recent invoices based on search query and status
  const filteredInvoices = dashboardData.recentInvoices.filter(invoice => {
    const matchesSearch = searchQuery === "" || 
      (invoice.number && invoice.number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.customer && invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.amount && invoice.amount.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

        {/* Monthly Activity Chart - 1/3 width */}
        <div className="w-5/6 justify mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 elegant-shadow hover:shadow-xl transition-smooth animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                {t('dashboard.charts.monthlyActivity', 'Monthly Activity')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.charts.monthlyActivityDescription', 'Invoices, estimates, receipts, and customers created per month')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <Bar data={monthlyChartData} options={monthlyChartOptions} />
              </div>
            </CardContent>
          </Card>
          
          {/* Empty space or future content */}
          <div className="col-span-2"></div>
        </div>

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
                    {searchQuery || statusFilter !== "all" 
                      ? `${filteredInvoices.length} of ${dashboardData.recentInvoices.length}`
                      : dashboardData.recentInvoices.length
                    } {t('dashboard.invoices.freeMonthly', 'invoices')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <TabsList className="grid w-full lg:w-auto grid-cols-2 bg-muted/50 p-1">
                      <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t('dashboard.invoices.tabs.all', 'All')} ({filteredInvoices.length})
                      </TabsTrigger>
                      <TabsTrigger value="estimates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t('dashboard.estimates.tabs.estimates', 'Estimates')} ({dashboardData.recentEstimates?.length || 0})
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <div className="relative flex-1 sm:w-60 lg:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder={t('dashboard.invoices.search', 'Search invoices...')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="bg-white/50 backdrop-blur-sm sm:w-auto w-full justify-between">
                            {statusFilter === "all" ? t('dashboard.invoices.filters.allStatus', 'All Status') :
                             statusFilter === "paid" ? t('dashboard.invoices.filters.paid', 'Paid') :
                             statusFilter === "pending" ? t('dashboard.invoices.filters.pending', 'Pending') :
                             statusFilter === "overdue" ? t('dashboard.invoices.filters.overdue', 'Overdue') :
                             statusFilter === "sent" ? t('dashboard.invoices.filters.sent', 'Sent') :
                             statusFilter === "draft" ? t('dashboard.invoices.filters.draft', 'Draft') : 'Status'}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                            {t('dashboard.invoices.filters.allStatus', 'All Status')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("paid")}>
                            {t('dashboard.invoices.filters.paid', 'Paid')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                            {t('dashboard.invoices.filters.pending', 'Pending')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("sent")}>
                            {t('dashboard.invoices.filters.sent', 'Sent')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>
                            {t('dashboard.invoices.filters.overdue', 'Overdue')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                            {t('dashboard.invoices.filters.draft', 'Draft')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <TabsContent value="all" className="space-y-4">
                    <div className="border border-gray-200/50 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                      {/* Table Header */}
                      <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-gradient-to-r from-gray-50 to-gray-100/30 border-b">
                        <div className="col-span-2">{t('dashboard.invoices.columns.invoice')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.customer')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.type', 'Type')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.dueDate')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.amount')}</div>
                        <div className="col-span-2">{t('dashboard.invoices.columns.status')}</div>
                      </div>

                      {/* Table Rows */}
                      <div className="divide-y divide-gray-200/30">
                        {filteredInvoices.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">
                              {dashboardData.recentInvoices.length === 0 
                                ? t('dashboard.invoices.noInvoices', 'No invoices yet. Create your first one!')
                                : t('dashboard.invoices.noFilteredResults', 'No invoices match your search criteria')
                              }
                            </p>
                          </div>
                        ) : (
                          filteredInvoices.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="md:grid md:grid-cols-12 gap-4 p-4 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group animate-fade-in"
                            >
                              {/* Mobile Layout */}
                              <div className="md:hidden space-y-2">
                                <div className="flex justify-between items-start">
                                  <div className="font-medium text-sm">{invoice.number}</div>
                                  <div className="text-sm font-medium">{invoice.amount}</div>
                                </div>
                                <div className="text-sm text-muted-foreground">{invoice.customer}</div>
                                <div className="flex justify-between items-center">
                                  <div className="text-xs text-muted-foreground">{invoice.dueDate}</div>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    invoice.type === 'French Invoice' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {invoice.type}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Desktop Layout */}
                              <div className="hidden md:block md:col-span-2 font-medium text-sm">
                                {invoice.number}
                              </div>
                              <div className="hidden md:block md:col-span-2 text-sm">
                                {invoice.customer}
                              </div>
                              <div className="hidden md:block md:col-span-2 text-xs">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  invoice.type === 'French Invoice' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {invoice.type}
                                </span>
                              </div>
                              <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                                {invoice.dueDate}
                              </div>
                              <div className="hidden md:block md:col-span-2 font-medium text-sm">
                                {invoice.amount}
                              </div>
                              {/* Status for Mobile */}
                              <div className="md:hidden">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`
                                        h-auto p-1 px-3 text-xs font-medium rounded-full border w-full
                                        ${invoice.status === "paid" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" : ""}
                                        ${invoice.status === "pending" ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : ""}
                                        ${invoice.status === "overdue" ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" : ""}
                                        ${invoice.status === "draft" ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" : ""}
                                        ${invoice.status === "sent" ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" : ""}
                                      `}
                                    >
                                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                      <ChevronDown className="h-3 w-3 ml-1" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'draft')}>
                                      <span className="text-gray-700">Draft</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'sent')}>
                                      <span className="text-orange-700">Sent</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'pending')}>
                                      <span className="text-blue-700">Pending</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'paid')}>
                                      <span className="text-green-700">Paid</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'overdue')}>
                                      <span className="text-red-700">Overdue</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Status for Desktop */}
                              <div className="hidden md:block md:col-span-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`
                                        h-auto p-1 px-3 text-xs font-medium rounded-full border
                                        ${invoice.status === "paid" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" : ""}
                                        ${invoice.status === "pending" ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : ""}
                                        ${invoice.status === "overdue" ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" : ""}
                                        ${invoice.status === "draft" ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" : ""}
                                        ${invoice.status === "sent" ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" : ""}
                                      `}
                                    >
                                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                      <ChevronDown className="h-3 w-3 ml-1" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'draft')}>
                                      <span className="text-gray-700">Draft</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'sent')}>
                                      <span className="text-orange-700">Sent</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'pending')}>
                                      <span className="text-blue-700">Pending</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'paid')}>
                                      <span className="text-green-700">Paid</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'overdue')}>
                                      <span className="text-red-700">Overdue</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="estimates" className="space-y-4">
                    <div className="border border-gray-200/50 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                      {/* Estimates Header */}
                      <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-gradient-to-r from-gray-50 to-gray-100/30 border-b">
                        <div className="col-span-3">{t('dashboard.estimates.columns.estimate', 'Estimate #')}</div>
                        <div className="col-span-3">{t('dashboard.estimates.columns.customer', 'Customer')}</div>
                        <div className="col-span-2">{t('dashboard.estimates.columns.date', 'Date')}</div>
                        <div className="col-span-2">{t('dashboard.estimates.columns.amount', 'Amount')}</div>
                        <div className="col-span-2">{t('dashboard.estimates.columns.status', 'Status')}</div>
                      </div>

                      {/* Estimates Content */}
                      <div className="divide-y divide-gray-200/30">
                        {dashboardData.recentEstimates?.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">{t('dashboard.estimates.noEstimates', 'No estimates yet. Create your first one!')}</p>
                            <Button 
                              onClick={() => handleNavigation("/estimate")} 
                              className="mt-4"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t('dashboard.estimates.createEstimate', 'Create Estimate')}
                            </Button>
                          </div>
                        ) : (
                          dashboardData.recentEstimates?.map((estimate) => (
                            <div
                              key={estimate.id}
                              className="md:grid md:grid-cols-12 gap-4 p-4 hover:bg-orange-50/30 transition-all duration-200 cursor-pointer group animate-fade-in"
                            >
                              {/* Mobile Layout */}
                              <div className="md:hidden space-y-2">
                                <div className="flex justify-between items-start">
                                  <div className="font-medium text-sm">{estimate.number}</div>
                                  <div className="text-sm font-medium">{estimate.amount}</div>
                                </div>
                                <div className="text-sm text-muted-foreground">{estimate.customer}</div>
                                <div className="flex justify-between items-center">
                                  <div className="text-xs text-muted-foreground">{estimate.date}</div>
                                  <Badge 
                                    variant="secondary"
                                    className={`text-xs
                                      ${estimate.status === "accepted" ? "bg-green-100 text-green-700" : ""}
                                      ${estimate.status === "pending" ? "bg-blue-100 text-blue-700" : ""}
                                      ${estimate.status === "rejected" ? "bg-red-100 text-red-700" : ""}
                                      ${estimate.status === "draft" ? "bg-gray-100 text-gray-700" : ""}
                                    `}
                                  >
                                    {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Desktop Layout */}
                              <div className="hidden md:block md:col-span-3 font-medium text-sm">
                                {estimate.number}
                              </div>
                              <div className="hidden md:block md:col-span-3 text-sm">
                                {estimate.customer}
                              </div>
                              <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                                {estimate.date}
                              </div>
                              <div className="hidden md:block md:col-span-2 font-medium text-sm">
                                {estimate.amount}
                              </div>
                              <div className="hidden md:block md:col-span-2">
                                <Badge 
                                  variant="secondary"
                                  className={`text-xs
                                    ${estimate.status === "accepted" ? "bg-green-100 text-green-700" : ""}
                                    ${estimate.status === "pending" ? "bg-blue-100 text-blue-700" : ""}
                                    ${estimate.status === "rejected" ? "bg-red-100 text-red-700" : ""}
                                    ${estimate.status === "draft" ? "bg-gray-100 text-gray-700" : ""}
                                  `}
                                >
                                  {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Link to Full Invoice Dashboard */}
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => handleNavigation("/invoice")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('dashboard.invoices.viewAll', 'Want to view all invoices? Click here')}
              </Button>
            </div>
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
                  {t('dashboard.recentActivity.title', 'Recent Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardData.recentActivities?.length > 0 ? (
                  dashboardData.recentActivities.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const colorClasses = getActivityColor(activity.type);
                    const link = getActivityLink(activity);
                    
                    const ActivityItem = ({ children }) => {
                      if (link) {
                        return (
                          <button
                            onClick={() => handleNavigation(link)}
                            className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50/50 transition-colors group cursor-pointer border border-transparent hover:border-gray-200"
                          >
                            {children}
                          </button>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2 p-2 rounded-lg">
                          {children}
                        </div>
                      );
                    };

                    return (
                      <ActivityItem key={activity.id}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorClasses}`}>
                          <IconComponent className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {activity.title}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {formatActivityTime(activity.timestamp)}
                          </div>
                        </div>
                        {link && (
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </ActivityItem>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs mt-1">Activity will appear here as you use the app</p>
                  </div>
                )}
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