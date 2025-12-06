import { useI18nContext } from './i18nContext';

/**
 * Custom hook for accessing translations
 * Supports nested key paths (e.g., "auth.errors.invalidEmail")
 * Falls back to English if translation key is missing
 */
export const useTranslation = () => {
  const { language, setLanguage, translations, isRTL } = useI18nContext();

  /**
   * Get translation by nested key path
   * @param key - Nested key path (e.g., "auth.welcome" or "onboarding.birthdate.question")
   * @param variables - Optional variables for interpolation (e.g., {count: 5})
   * @returns Translated string or key if not found
   */
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }

    // If value is not a string, return the key
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key} for language: ${language}`);
      return key;
    }

    // Handle variable interpolation
    if (variables) {
      return Object.entries(variables).reduce((str, [varKey, varValue]) => {
        return str.replace(new RegExp(`{${varKey}}`, 'g'), String(varValue));
      }, value);
    }

    return value;
  };

  /**
   * Get array translation by key
   * Useful for lists like months, etc.
   */
  const tArray = (key: string): string[] => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return [];
      }
    }

    if (Array.isArray(value)) {
      return value;
    }

    console.warn(`Translation value is not an array: ${key} for language: ${language}`);
    return [];
  };

  /**
   * Get object translation by key
   * Useful for structured data like language levels, etc.
   */
  const tObject = (key: string): Record<string, any> => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return {};
      }
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }

    console.warn(`Translation value is not an object: ${key} for language: ${language}`);
    return {};
  };

  return {
    t,
    tArray,
    tObject,
    language,
    setLanguage,
    isRTL,
  };
};
