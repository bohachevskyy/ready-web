/**
 * Shared TypeScript types for the application
 */

export interface SavedWord {
  id: string
  word: string
  translation: string
  timestamp: number
}

export interface Translation {
  word: string
  translation: string
  language: string
}

export interface VocabularyState {
  savedWords: SavedWord[]
}
