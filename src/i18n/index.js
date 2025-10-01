import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import frCommon from './resources/fr/common.json';
import enCommon from './resources/en/common.json';

const resources = {
  fr: {
    common: frCommon,
  },
  en: {
    common: enCommon,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // French as default
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    // Debug mode - can be disabled in production
    debug: import.meta.env.DEV,
  });

export default i18n;