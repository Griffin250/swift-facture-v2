import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import TemplatePage from "./pages/TemplatePage";
import ReceiptPage from "./pages/ReceiptPage";
import Index from "./pages/Index";
import About from "./pages/About";
import Premium from "./pages/Premium";
import Footer from "./components/Footer";
import Header from "./components/Header";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import Estimates from "./pages/Estimates";
import Customers from "./pages/Customers";
import JwtAuthSystem from "./pages/JwtAuthSystem";
import EstimatedInvoice from "./pages/EstimatedInvoice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
      <Header />
      
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoice" element={<Index />} />
          <Route path="/template" element={<TemplatePage />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/premium" element={<Premium />} />
             <Route path="/customers" element={<Customers />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/authpage" element={<AuthPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/estimated-invoice" element={<EstimatedInvoice />} />
          <Route path="/jwt-auth" element={<JwtAuthSystem />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
  <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
