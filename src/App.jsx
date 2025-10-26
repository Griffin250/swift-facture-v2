import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { navItems } from "./nav-items";
import TemplatePage from "./pages/TemplatePage";
import Receipts from "./pages/Receipts";
import Invoice from "./pages/Invoice";
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
        <Route path="/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
        <Route path="/template" element={<ProtectedRoute><TemplatePage /></ProtectedRoute>} />
        <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/account" element={<Account />} />
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
