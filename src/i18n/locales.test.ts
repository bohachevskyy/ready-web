import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import pl from './locales/pl.json';
import uk from './locales/uk.json';

type LocaleValue = string | number | boolean | null | LocaleValue[] | { [key: string]: LocaleValue };
type LocaleObject = { [key: string]: LocaleValue };

const supportedLocales: Record<string, LocaleObject> = {
  es,
  pt,
  pl,
  uk,
};

const getLeafPaths = (value: LocaleValue, prefix = ''): string[] => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      getLeafPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [prefix];
};

const getValueAtPath = (source: LocaleObject, path: string): LocaleValue | undefined =>
  path.split('.').reduce<LocaleValue | undefined>((current, key) => {
    if (current && typeof current === 'object' && !Array.isArray(current) && key in current) {
      return current[key];
    }

    return undefined;
  }, source);

describe('supported locale files', () => {
  const englishLeafPaths = getLeafPaths(en as LocaleObject);

  it.each(Object.entries(supportedLocales))('%s contains every English translation key', (_lang, locale) => {
    const missingKeys = englishLeafPaths.filter((path) => getValueAtPath(locale, path) === undefined);

    expect(missingKeys).toEqual([]);
  });

  it.each(Object.entries(supportedLocales))('%s has non-empty string values for every translated string', (_lang, locale) => {
    const emptyStringKeys = englishLeafPaths.filter((path) => {
      const englishValue = getValueAtPath(en as LocaleObject, path);
      const translatedValue = getValueAtPath(locale, path);

      return typeof englishValue === 'string' && typeof translatedValue === 'string' && translatedValue.trim() === '';
    });

    expect(emptyStringKeys).toEqual([]);
  });

  it.each(Object.entries(supportedLocales))('%s localizes visible mode-selection copy', (_lang, locale) => {
    const visibleModeSelectionKeys = [
      'modeSelection.title',
      'modeSelection.readStories',
      'modeSelection.practiceWords',
      'modeSelection.visualsTitle',
      'modeSelection.momentumTitle',
    ];

    const untranslatedKeys = visibleModeSelectionKeys.filter(
      (path) => getValueAtPath(locale, path) === getValueAtPath(en as LocaleObject, path),
    );

    expect(untranslatedKeys).toEqual([]);
  });
});
