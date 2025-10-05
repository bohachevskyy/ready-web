/**
 * Mock translation data
 * This will be replaced with real API calls in production
 */

export interface Translation {
  word: string
  translation: string
  language: string
}

export const MOCK_TRANSLATIONS: Record<string, string> = {
  heart: "серце",
  ancient: "давній",
  forest: "ліс",
  sunlight: "сонячне світло",
  filtered: "фільтрований",
  dense: "густий",
  canopy: "навіс",
  village: "село",
  thrived: "процвітав",
  harmony: "гармонія",
  nature: "природа",
  villagers: "селяни",
  exceptional: "виняткові",
  craftsmanship: "майстерність",
  respect: "повага",
  environment: "навколишнє середовище",
  morning: "ранок",
  gather: "збиратися",
  central: "центральний",
  square: "площа",
  stories: "історії",
  daily: "щоденний",
  activities: "діяльність",
  elders: "старійшини",
  taught: "навчили",
  importance: "важливість",
  preserving: "зберігати",
  traditions: "традиції",
  embracing: "обіймати",
  knowledge: "знання",
  gentle: "ніжний",
  pace: "темп",
  appreciate: "цінувати",
  beauty: "краса",
  surrounded: "оточений",
}

/**
 * Mock translation function to simulate API response
 */
export const getMockTranslation = (word: string): Translation => {
  const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "")
  const translation = MOCK_TRANSLATIONS[cleanWord] || `переклад "${word}"`

  return {
    word: cleanWord,
    translation,
    language: "uk", // Ukrainian
  }
}
