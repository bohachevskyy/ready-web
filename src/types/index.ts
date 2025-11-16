/**
 * Shared TypeScript types for the application
 */

export interface SavedWord {
  id: string
  word: string
  translation: string
  timestamp: number
  grammatical_info?: string
  sentence_translation?: string
  example_sentence?: string
}

export interface Translation {
  word: string
  translation: string
  language: string
}

export interface VocabularyState {
  savedWords: SavedWord[]
}

// Word Training Types
export interface Word {
  id: string
  word: string
  translation: string
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: "new" | "learning" | "review" | "relearning"
}

export interface WordReview {
  word_id: string
  rating: 1 | 2 | 3 | 4 // 1=again, 2=hard, 3=good, 4=easy
  review_duration_ms: number
}

export interface WordsCountResponse {
  count: number
}
