import { mapBrowserLanguageToSupported, detectBrowserLanguage } from './languageDetection';
import { SupportedLanguage } from './i18nContext';

describe('languageDetection', () => {
  describe('mapBrowserLanguageToSupported', () => {
    it('should map base language codes to supported languages', () => {
      expect(mapBrowserLanguageToSupported('en')).toBe('en');
      expect(mapBrowserLanguageToSupported('uk')).toBe('uk');
      expect(mapBrowserLanguageToSupported('es')).toBe('es');
      expect(mapBrowserLanguageToSupported('pt')).toBe('pt');
      expect(mapBrowserLanguageToSupported('pl')).toBe('pl');
    });

    it('should map regional variants with hyphen to base language', () => {
      expect(mapBrowserLanguageToSupported('en-US')).toBe('en');
      expect(mapBrowserLanguageToSupported('en-GB')).toBe('en');
      expect(mapBrowserLanguageToSupported('uk-UA')).toBe('uk');
      expect(mapBrowserLanguageToSupported('es-ES')).toBe('es');
      expect(mapBrowserLanguageToSupported('es-MX')).toBe('es');
      expect(mapBrowserLanguageToSupported('pt-BR')).toBe('pt');
      expect(mapBrowserLanguageToSupported('pt-PT')).toBe('pt');
      expect(mapBrowserLanguageToSupported('pl-PL')).toBe('pl');
    });

    it('should map regional variants with underscore to base language', () => {
      expect(mapBrowserLanguageToSupported('en_US')).toBe('en');
      expect(mapBrowserLanguageToSupported('uk_UA')).toBe('uk');
      expect(mapBrowserLanguageToSupported('es_ES')).toBe('es');
    });

    it('should handle uppercase and mixed case language codes', () => {
      expect(mapBrowserLanguageToSupported('EN')).toBe('en');
      expect(mapBrowserLanguageToSupported('EN-US')).toBe('en');
      expect(mapBrowserLanguageToSupported('En-Us')).toBe('en');
      expect(mapBrowserLanguageToSupported('UK')).toBe('uk');
      expect(mapBrowserLanguageToSupported('UK-UA')).toBe('uk');
    });

    it('should return null for unsupported languages', () => {
      expect(mapBrowserLanguageToSupported('sv')).toBeNull(); // Swedish
      expect(mapBrowserLanguageToSupported('sv-SE')).toBeNull();
      expect(mapBrowserLanguageToSupported('no')).toBeNull(); // Norwegian
      expect(mapBrowserLanguageToSupported('da')).toBeNull(); // Danish
      expect(mapBrowserLanguageToSupported('fi')).toBeNull(); // Finnish
      expect(mapBrowserLanguageToSupported('fr')).toBeNull(); // French
      expect(mapBrowserLanguageToSupported('de')).toBeNull(); // German
      expect(mapBrowserLanguageToSupported('it')).toBeNull(); // Italian
      expect(mapBrowserLanguageToSupported('zh')).toBeNull(); // Chinese
      expect(mapBrowserLanguageToSupported('ja')).toBeNull(); // Japanese
    });

    it('should return null for empty or invalid input', () => {
      expect(mapBrowserLanguageToSupported('')).toBeNull();
      expect(mapBrowserLanguageToSupported('   ')).toBeNull();
    });
  });

  describe('detectBrowserLanguage', () => {
    const originalNavigator = global.navigator;

    afterEach(() => {
      // Restore original navigator after each test
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });

    it('should detect supported language from navigator.language', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'uk-UA', languages: [] },
        writable: true,
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('uk');
    });

    it('should detect supported language from navigator.languages array', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US', languages: ['es-ES', 'en-US'] },
        writable: true,
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('es');
    });

    it('should use first supported language from navigator.languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US', languages: ['sv-SE', 'no-NO', 'es-ES', 'pt-PT'] },
        writable: true,
        configurable: true,
      });

      // Should skip Swedish and Norwegian (unsupported) and use Spanish
      expect(detectBrowserLanguage()).toBe('es');
    });

    it('should fallback to navigator.language when languages array is empty', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'pl-PL', languages: [] },
        writable: true,
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('pl');
    });

    it('should fallback to navigator.language when all languages in array are unsupported', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'pt-PT', languages: ['sv-SE', 'no-NO'] },
        writable: true,
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('pt');
    });

    it('should fallback to English when browser language is unsupported', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'sv-SE', languages: ['sv-SE'] },
        writable: true,
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('en');
    });

    it('should fallback to English when navigator.language is undefined', () => {
      Object.defineProperty(global, 'navigator', {
        value: { languages: [] },
        writable: true,
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('en');
    });

    it('should fallback to English when navigator.languages is undefined', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: undefined },
        writable: true,
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('en');
    });

    it('should fallback to English when navigator throws an error', () => {
      Object.defineProperty(global, 'navigator', {
        get() {
          throw new Error('Navigator not available');
        },
        configurable: true,
      });

      expect(detectBrowserLanguage()).toBe('en');
    });

    it('should handle all 5 supported languages', () => {
      const testCases: Array<{ input: string; expected: SupportedLanguage }> = [
        { input: 'en-US', expected: 'en' },
        { input: 'uk-UA', expected: 'uk' },
        { input: 'es-ES', expected: 'es' },
        { input: 'pt-BR', expected: 'pt' },
        { input: 'pl-PL', expected: 'pl' },
      ];

      testCases.forEach(({ input, expected }) => {
        Object.defineProperty(global, 'navigator', {
          value: { language: input, languages: [input] },
          writable: true,
          configurable: true,
        });

        expect(detectBrowserLanguage()).toBe(expected);
      });
    });
  });
});
