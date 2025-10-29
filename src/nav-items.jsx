
import Dashboard from "./pages/Dashboard.jsx";
import InvoicePage from "./pages/InvoicePage.jsx";
import TemplatesPage from "./pages/TemplatesPage.jsx";
import CustomTemplatesPage from "./pages/CustomTemplatesPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Dashboard",
    to: "/",
    page: <Dashboard />,
  },
  {
    title: "Invoice",
    to: "/invoice", 
    page: <ProtectedRoute><InvoicePage /></ProtectedRoute>,
  },
  {
    title: "Templates",
    to: "/templates",
    page: <ProtectedRoute><TemplatesPage /></ProtectedRoute>,
  },
  {
    title: "Custom Templates",
    to: "/custom-templates",
    page: <ProtectedRoute><CustomTemplatesPage /></ProtectedRoute>,
  },
];
