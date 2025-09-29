import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import SwiftFactureLogo from "../../public/assets/logo/SwiftFactureLogo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import usaFlag from "../../public/assets/icons/usaFlag.png";
import franceFlag from "../../public/assets/icons/franceFlag.png";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("fr"); // French as default
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", to: "/" },
    { label: "About", to: "/about" },
    { label: "Invoice", to: "/invoice" },
    { label: "Estimate", to: "/estimate" },
    { label: "Receipt", to: "/receipt" },
    { label: "Customers", to: "/customers" },
  ];

  // Language data with flag components
  const languages = {
    fr: {
      code: "fr",
      icon: franceFlag,
      name: "Français",
    },
    en: {
      code: "en",
      icon: usaFlag,
      name: "English",
    },
  };

  const location = useLocation();

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  // Navigation handler that scrolls to top and closes mobile menu
  const handleNavigation = (to) => {
    navigate(to);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Close mobile menu if it's open
    setOpen(false);
  };

  return (
    <header className="glass-card sticky top-0 z-50 px-4 py-3 animate-fade-in bg-gray-100">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              {/*..<FileText className="h-5 w-5 text-white" />..*/}
              <img
                src={SwiftFactureLogo}
                alt="SwiftFacture Logo"
                className="w-auto"
              />
            </div>
            <div className="m-2">
              <h1 className="text-xl md:text-2xl font-bold gradient-text">
                SwiftFacture
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block font-bold">
                Fast. Professional. Effortless.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => handleNavigation(item.to)}
              className={`text-sm font-medium px-3 py-2 hover:text-blue-700 rounded-md transition-smooth ${
                isActive(item.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Dropdown - visible on all screen sizes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium">
                <img
                  src={languages[language].icon}
                  alt={`${languages[language].name} flag`}
                  className="w-4 h-3 md:w-5 md:h-4 object-cover rounded-sm"
                />
                <span className="hidden sm:inline text-xs md:text-sm">
                  {languages[language].code.toUpperCase()}
                </span>
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-gray-800 font-bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {Object.values(languages).map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-2 cursor-pointer ${
                    language === lang.code ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  <img
                    src={lang.icon}
                    alt={`${lang.name} flag`}
                    className="w-5 h-4 object-cover rounded-sm"
                  />
                  <span className="text-sm">{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => handleNavigation("/premium")}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-blue-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            >
              <span className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium
              </span>
            </button>

            <button
              onClick={() => handleNavigation("/authpage")}
              className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold text-sm shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 hover:bg-gray-50 hover:border-gray-400"
            >
              <span className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Account
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted/50"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden bg-background/80 border-t border-border/20">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => handleNavigation(item.to)}
                className={`text-left w-full px-3 py-2 rounded-md text-sm ${
                  isActive(item.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleNavigation("/premium")}
                className="flex-1 px-3 py-2 rounded-md bg-accent/10 text-accent-foreground bg-gradient-to-r from-red-500 to-blue-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </span>
              </button>

              <button
                onClick={() => handleNavigation("/authpage")}
                className="flex-1 px-3 py-2 rounded-md bg-accent/10 text-accent-foreground bg-white border border-gray-300 text-gray-700 font-semibold text-sm shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 hover:bg-gray-50 hover:border-gray-400"
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Account
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
