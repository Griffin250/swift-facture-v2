import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Eye,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Mock chart components (replace with actual chart library)
const RevenueChart = () => (
  <div className="h-48 bg-gradient-to-b from-blue-500/10 to-transparent rounded-lg p-4">
    <div className="flex items-end justify-between h-32 gap-1">
      {[65, 80, 60, 90, 75, 95, 70].map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-blue-300"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
    <div className="flex justify-between text-xs text-muted-foreground mt-2">
      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
        <span key={month}>{month}</span>
      ))}
    </div>
  </div>
);

const InvoiceStatusChart = () => (
  <div className="h-48 flex items-center justify-center">
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 border-8 border-green-500 rounded-full border-r-transparent transform -rotate-45" />
      <div className="absolute inset-2 border-8 border-yellow-500 rounded-full border-l-transparent border-b-transparent transform rotate-45" />
      <div className="absolute inset-4 border-8 border-red-500 rounded-full border-t-transparent border-r-transparent transform rotate-45" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">156</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Total Invoices",
      value: "156",
      icon: FileText,
      change: "+12%",
      trend: "up",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Revenue",
      value: "$45,231",
      icon: DollarSign,
      change: "+18%",
      trend: "up",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Outstanding",
      value: "23",
      icon: TrendingUp,
      change: "-5%",
      trend: "down",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "This Month",
      value: "$12,543",
      icon: Calendar,
      change: "+25%",
      trend: "up",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const recentInvoices = [
    {
      id: 1,
      number: "INV-1001",
      customer: "Acme Corporation",
      date: "Jan 15, 2024",
      dueDate: "Feb 14, 2024",
      amount: "$3,250",
      status: "Paid",
      priority: "high",
    },
    {
      id: 2,
      number: "INV-1002",
      customer: "Tech Solutions Inc",
      date: "Jan 14, 2024",
      dueDate: "Feb 13, 2024",
      amount: "$1,850",
      status: "Pending",
      priority: "medium",
    },
    {
      id: 3,
      number: "INV-1003",
      customer: "Digital Agency Ltd",
      date: "Jan 13, 2024",
      dueDate: "Feb 12, 2024",
      amount: "$4,100",
      status: "Overdue",
      priority: "high",
    },
    {
      id: 4,
      number: "INV-1004",
      customer: "StartUp Co",
      date: "Jan 12, 2024",
      dueDate: "Feb 11, 2024",
      amount: "$750",
      status: "Paid",
      priority: "low",
    },
  ];

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
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex gap-3 mt-6 lg:mt-0">
            <Button
              onClick={() => navigate("/receipt")}
              variant="outline"
              className="gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
            >
              <Receipt className="h-4 w-4" />
              Create Receipt
            </Button>
            <Button 
              onClick={() => navigate("/invoice")} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Stats Grid with Animations */}
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

        {/* Charts & Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="xl:col-span-2 bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Revenue Overview
              </CardTitle>
              <CardDescription>
                Monthly revenue performance for the last 7 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>

          {/* Invoice Status Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Invoice Status
              </CardTitle>
              <CardDescription>
                Distribution of invoice statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceStatusChart />
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Paid</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Overdue</span>
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
                    <CardTitle>Recent Invoices</CardTitle>
                    <CardDescription>
                      Manage and track your recent invoices
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-200">
                    Free monthly invoices: 0/5
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <TabsList className="grid w-full lg:w-auto grid-cols-4 bg-muted/50 p-1">
                      <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        All ({recentInvoices.length})
                      </TabsTrigger>
                      <TabsTrigger value="outstanding" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Outstanding (2)
                      </TabsTrigger>
                      <TabsTrigger value="drafts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Drafts (0)
                      </TabsTrigger>
                      <TabsTrigger value="more" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        More
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2 w-full lg:w-auto">
                      <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search invoices..."
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
                        <div className="col-span-3">INVOICE</div>
                        <div className="col-span-3">CUSTOMER</div>
                        <div className="col-span-2">DUE DATE</div>
                        <div className="col-span-2">AMOUNT</div>
                        <div className="col-span-2">STATUS</div>
                      </div>

                      {/* Table Rows */}
                      <div className="divide-y divide-gray-200/30">
                        {recentInvoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            className="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
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
                                  invoice.status === "Paid"
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
                                {invoice.status}
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
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: FileText, label: "Create Invoice", action: () => navigate("/invoice") },
                  { icon: Receipt, label: "Generate Receipt", action: () => navigate("/receipt") },
                  { icon: Users, label: "Manage Customers", action: () => {} },
                  { icon: Download, label: "Export Reports", action: () => {} },
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
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: "Invoice paid", details: "INV-1001 - Acme Corp", time: "2 hours ago" },
                  { action: "New invoice created", details: "INV-1005 - Tech Startup", time: "5 hours ago" },
                  { action: "Receipt generated", details: "RC-0456 - Retail Client", time: "1 day ago" },
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
      </main>
    </div>
  );
};

export default Dashboard;