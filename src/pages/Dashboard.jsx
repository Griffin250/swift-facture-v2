import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, FileText, Receipt, Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { title: "Total Invoices", value: "156", icon: FileText, change: "+12%", trend: "up" },
    { title: "Total Revenue", value: "$45,231", icon: DollarSign, change: "+18%", trend: "up" },
    { title: "Outstanding", value: "23", icon: TrendingUp, change: "-5%", trend: "down" },
    { title: "This Month", value: "$12,543", icon: Calendar, change: "+25%", trend: "up" },
  ];

  const recentInvoices = [
    { number: "INV-1001", customer: "Acme Corporation", date: "Jan 15, 2024", amount: "$3,250", status: "Paid", priority: "high" },
    { number: "INV-1002", customer: "Tech Solutions Inc", date: "Jan 14, 2024", amount: "$1,850", status: "Pending", priority: "medium" },
    { number: "INV-1003", customer: "Digital Agency Ltd", date: "Jan 13, 2024", amount: "$4,100", status: "Overdue", priority: "high" },
    { number: "INV-1004", customer: "StartUp Co", date: "Jan 12, 2024", amount: "$750", status: "Paid", priority: "low" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navigation Header 
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
         
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">PayFlow</span>
            </div>

            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-primary font-medium border-b-2 border-primary pb-1">Home</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Customers</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Products</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Invoices</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Reports</a>
            </nav>

        
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">Premium</Button>
              <Button variant="ghost" size="sm">Help</Button>
              <Button variant="ghost" size="sm">My account</Button>
            </div>
          </div>
        </div>
      </header>
*/}
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
           
           
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button 
              onClick={() => navigate('/receipt')}
              variant="outline"
              className="gap-2"
            >
              <Receipt className="h-4 w-4" />
              Create Receipt
            </Button>
            <Button 
              onClick={() => navigate('/invoice')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className={`text-sm font-medium mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>{stat.change}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                    <stat.icon className={`h-5 w-5 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Invoices Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="card-modern">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoices</CardTitle>
                  <Badge variant="secondary">Free monthly invoices: 0/5</Badge>
                </div>
                <CardDescription>
                  Select an invoice from the list to view details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <TabsList className="grid w-full md:w-auto grid-cols-4">
                      <TabsTrigger value="all">All ({recentInvoices.length})</TabsTrigger>
                      <TabsTrigger value="outstanding">Outstanding (2)</TabsTrigger>
                      <TabsTrigger value="drafts">Drafts (0)</TabsTrigger>
                      <TabsTrigger value="more">More</TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search from list"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={() => navigate('/invoice')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Invoice
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="all" className="space-y-4">
                    <div className="border rounded-lg">
                      <div className="grid grid-cols-6 gap-4 p-4 text-sm font-medium text-muted-foreground border-b bg-muted/30">
                        <div>NUMBER</div>
                        <div>CUSTOMER</div>
                        <div>CREATED</div>
                        <div>DUE DATE</div>
                        <div>TOTAL</div>
                        <div>STATUS</div>
                      </div>
                      
                      <div className="divide-y">
                        {recentInvoices.map((invoice, index) => (
                          <div key={index} className="grid grid-cols-6 gap-4 p-4 hover:bg-muted/50 transition-smooth cursor-pointer">
                            <div className="font-medium">{invoice.number}</div>
                            <div>{invoice.customer}</div>
                            <div className="text-muted-foreground">{invoice.date}</div>
                            <div className="text-muted-foreground">Due in 30 days</div>
                            <div className="font-medium">{invoice.amount}</div>
                            <div>
                              <Badge 
                                variant={
                                  invoice.status === "Paid" ? "default" : 
                                  invoice.status === "Overdue" ? "destructive" : 
                                  "secondary"
                                }
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

          <div>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate('/invoice')}
                  className="w-full justify-start gap-3" 
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  Create Invoice
                </Button>
                <Button 
                  onClick={() => navigate('/receipt')}
                  className="w-full justify-start gap-3" 
                  variant="outline"
                >
                  <Receipt className="h-4 w-4" />
                  Generate Receipt
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <Users className="h-4 w-4" />
                  Manage Customers
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <TrendingUp className="h-4 w-4" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;