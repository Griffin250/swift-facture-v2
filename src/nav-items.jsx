
import Dashboard from "./pages/Dashboard.jsx";
import Invoice from "./pages/Invoice.jsx";
import FrenchInvoicePage from "./pages/FrenchInvoicePage.jsx";

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
    page: <Invoice />,
  },
  {
    title: "Facture Française",
    to: "/french-invoice",
    page: <FrenchInvoicePage />,
  },
];
