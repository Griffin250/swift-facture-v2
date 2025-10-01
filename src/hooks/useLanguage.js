import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = useCallback((lng) => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
    }
  }, [i18n]);
  
  const currentLanguage = i18n?.language || 'fr';
  
  return {
    currentLanguage,
    changeLanguage,
    isLoading: !i18n?.isInitialized
  };
};