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

// Word Training Types (matches backend API response)
export interface Word {
  id: string
  name: string // The word itself
  sentence_context?: string // Example sentence
  due_at: string // When the word is due for review
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: "New" | "Learning" | "Review" | "Relearning"
}

export interface WordReview {
  word_id: string
  rating: 1 | 2 | 3 | 4 // 1=again, 2=hard, 3=good, 4=easy
  review_duration_ms: number
}

export interface WordsCountResponse {
  count: number
}
