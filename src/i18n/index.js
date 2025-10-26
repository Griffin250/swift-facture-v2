import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import frCommon from './resources/fr/common.json';
import enCommon from './resources/en/common.json';
import frChatbot from './resources/fr/chatbot.json';
import enChatbot from './resources/en/chatbot.json';

const resources = {
  fr: {
    common: frCommon,
    chatbot: frChatbot.chatbot
  },
  en: {
    common: enCommon,
    chatbot: enChatbot.chatbot
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // French as default
    ns: ['common', 'chatbot'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    debug: false, // Disabled to reduce console noise
  });

export default i18n;