import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { navItems } from "./nav-items";
import CustomTemplatesPage from "./pages/CustomTemplatesPage";
import Receipts from "./pages/Receipts";
import TemplatesPage from "./pages/TemplatesPage";
import InvoicePage from "./pages/InvoicePage";
import About from "./pages/About";
import Premium from "./pages/Premium";
import Footer from "./components/Footer";
import Header from "./components/Header";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Estimate from "./pages/Estimate";
import Customers from "./pages/Customers";
import { AuthProvider } from "./contexts/AuthContext";
import ChatbotPanel from "./components/ChatbotPanel";
import InstallPWAButton from "./components/InstallPWAButton";

// Profile pages
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import DebugAuth from "./pages/DebugAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import NotificationPage from "./components/admin/NotificationPage";
import AdminRoute from "./components/admin/AdminRoute";
import EmailVerification from "./pages/EmailVerification";
import FrenchInvoiceDemo from "./pages/FrenchInvoiceDemo";
import Account from "./pages/Account";
import Billing from "./pages/Billing";
import PremiumErrorBoundary from "./components/PremiumErrorBoundary";

// GDPR and Legal pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import DataRequestPage from "./pages/DataRequestPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/login';

  return (
    <>
      <InstallPWAButton />
      {!isAdminRoute && !isLoginRoute && <Header />}
      <Routes>
        {navItems.map(({ to, page }) => (
          <Route key={to} path={to} element={page} />
        ))}
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
        <Route path="/custom-templates" element={<ProtectedRoute><CustomTemplatesPage /></ProtectedRoute>} />
        <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
        <Route path="/premium" element={
          <PremiumErrorBoundary>
            <Premium />
          </PremiumErrorBoundary>
        } />
        <Route path="/account" element={<Account />} />
        <Route path="/billing" element={
          <ProtectedRoute>
            <PremiumErrorBoundary>
              <Billing />
            </PremiumErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/estimate" element={<ProtectedRoute><Estimate /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/verify" element={<EmailVerification />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path="/customizable-invoice" element={<FrenchInvoiceDemo />} />
        
        {/* GDPR and Legal Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy/data-requests" element={<DataRequestPage />} />
        
        <Route path="/admin/*" element={<ProtectedRoute><AdminRoute><AdminPage /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><NotificationPage /> </ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Show ChatbotPanel for authenticated users on non-admin, non-login routes */}
      {!isAdminRoute && !isLoginRoute && <ChatbotPanel />}
      {!isAdminRoute && !isLoginRoute && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
