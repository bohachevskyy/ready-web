import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setUILanguage } from '../store/authSlice';
import { detectBrowserLanguage } from './languageDetection';

// Import all translation files
import en from './locales/en.json';
import uk from './locales/uk.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import pl from './locales/pl.json';

export type SupportedLanguage = 'en' | 'es' | 'pt' | 'pl' | 'uk';

interface TranslationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translations: Record<string, any>;
  isRTL: boolean;
}

const translations: Record<SupportedLanguage, Record<string, any>> = {
  en,
  uk,
  es,
  pt,
  pl,
};

const RTL_LANGUAGES: SupportedLanguage[] = [];

const I18nContext = createContext<TranslationContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const uiLanguage = useSelector((state: RootState) => state.auth.uiLanguage);
  const [language, setLanguageState] = useState<SupportedLanguage>((uiLanguage as SupportedLanguage) || 'en');
  const [isRTL, setIsRTL] = useState(false);

  // Auto-detect browser language on first visit
  useEffect(() => {
    if (!uiLanguage) {
      const detected = detectBrowserLanguage();
      dispatch(setUILanguage(detected));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    if (uiLanguage && uiLanguage !== language) {
      setLanguageState(uiLanguage as SupportedLanguage);
    }
  }, [uiLanguage, language]);

  useEffect(() => {
    setIsRTL(RTL_LANGUAGES.includes(language));
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    dispatch(setUILanguage(lang));
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        translations: translations[language] || translations.en,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
};
