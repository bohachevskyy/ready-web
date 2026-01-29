import { SupportedLanguage } from './i18nContext';

/**
 * List of all supported language codes in the application
 */
const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'en', 'uk', 'es', 'pt', 'pl'
];

/**
 * Maps browser language codes to supported language codes.
 * Handles regional variants (e.g., 'en-US', 'en-GB' → 'en')
 *
 * @param browserLang - Browser language code (e.g., 'en-US', 'uk', 'uk-UA')
 * @returns Supported language code or null if not supported
 */
export function mapBrowserLanguageToSupported(browserLang: string): SupportedLanguage | null {
  if (!browserLang) {
    return null;
  }

  // Normalize to lowercase
  const normalized = browserLang.toLowerCase();

  // Extract base language code (before hyphen or underscore)
  const baseLang = normalized.split(/[-_]/)[0];

  // Check if the base language is supported
  if (SUPPORTED_LANGUAGES.includes(baseLang as SupportedLanguage)) {
    return baseLang as SupportedLanguage;
  }

  return null;
}

/**
 * Detects the user's browser language and returns a supported language code.
 * Tries navigator.languages first (ordered by user preference), then navigator.language.
 * Falls back to 'en' if no supported language is detected.
 *
 * @returns Supported language code (never null, always returns a valid language)
 */
export function detectBrowserLanguage(): SupportedLanguage {
  const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

  try {
    // Try navigator.languages first (user's preferred languages in order)
    if (navigator.languages && navigator.languages.length > 0) {
      for (const lang of navigator.languages) {
        const mapped = mapBrowserLanguageToSupported(lang);
        if (mapped) {
          return mapped;
        }
      }
    }

    // Fallback to navigator.language
    if (navigator.language) {
      const mapped = mapBrowserLanguageToSupported(navigator.language);
      if (mapped) {
        return mapped;
      }
    }
  } catch (error) {
    // If navigator is not available or throws an error, use default
    console.warn('Failed to detect browser language, using default:', error);
  }

  // Final fallback to English
  return DEFAULT_LANGUAGE;
}
