import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import usaFlag from "../../public/assets/icons/usaFlag.png";
import franceFlag from "../../public/assets/icons/franceFlag.png";
import { useLanguage } from "../hooks/useLanguage";

const LanguageSwitcher = ({ className = "", compact = false }) => {
  const { t, ready } = useTranslation('common');
  const { currentLanguage, changeLanguage } = useLanguage();
  const [language, setLanguage] = useState(currentLanguage);

  // Fallback function for when translations aren't ready
  const getTranslation = (key, fallback) => {
    if (!ready) return fallback;
    return t(key);
  };

  // Language data with flag components - with fallbacks
  const languages = {
    fr: {
      code: "fr",
      icon: franceFlag,
      name: getTranslation('language.french', 'Français'),
    },
    en: {
      code: "en",
      icon: usaFlag,
      name: getTranslation('language.english', 'English'),
    },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium ${className}`}
        >
          {languages[language] && (
            <>
              <img
                src={languages[language].icon}
                alt={`${languages[language].name} flag`}
                className={compact ? "w-4 h-3 object-cover rounded-sm" : "w-4 h-3 md:w-5 md:h-4 object-cover rounded-sm"}
              />
              {!compact && (
                <span className="hidden sm:inline text-xs md:text-sm text-gray-900 dark:text-white">
                  {languages[language].code.toUpperCase()}
                </span>
              )}
            </>
          )}
          <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-gray-900 dark:text-white font-bold" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {Object.values(languages).map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              changeLanguage(lang.code);
              setLanguage(lang.code);
            }}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang.code ? "bg-primary/10 text-primary" : ""
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
  );
};

export default LanguageSwitcher;