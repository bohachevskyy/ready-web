import { Word } from '../types'

/**
 * FSRS Card data structure for UI
 * Represents a flashcard with spaced repetition metadata
 */
export type FSRSCard = {
  id: string
  word: string
  translation?: string
  sentenceContext?: string
  sentenceTranslation?: string
  due: Date
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: "new" | "learning" | "review" | "relearning"
}

/**
 * Rating options for flashcard review
 */
export type FSRSRating = "again" | "hard" | "good" | "easy"

/**
 * Convert API Word format to FSRSCard format
 *
 * @param word - Word object from API
 * @returns FSRSCard ready for UI display
 */
export function wordToCard(word: Word): FSRSCard {
  return {
    id: word.id,
    word: word.name,
    translation: word.translation,
    sentenceContext: word.sentence_context,
    sentenceTranslation: word.sentence_translation,
    due: new Date(word.due_at),
    stability: word.stability,
    difficulty: word.difficulty,
    elapsedDays: word.elapsed_days,
    scheduledDays: word.scheduled_days,
    reps: word.reps,
    lapses: word.lapses,
    state: word.state ? word.state.toLowerCase() as "new" | "learning" | "review" | "relearning" : "new",
  }
}

/**
 * Simplified FSRS algorithm for UI preview (actual calculation is server-side)
 *
 * This is a client-side preview for UX purposes. The server will perform
 * the authoritative calculation.
 *
 * Algorithm based on Free Spaced Repetition Scheduler (FSRS)
 *
 * @param card - Current card state
 * @param rating - User's rating of how well they remembered
 * @returns Updated card with new scheduling parameters
 */
export function calculateNextReview(card: FSRSCard, rating: FSRSRating): FSRSCard {
  const now = new Date()
  let newStability = card.stability
  let newDifficulty = card.difficulty
  let scheduledDays = 0

  // Initialize difficulty for new cards
  if (card.state === "new") {
    newDifficulty = 5
  }

  // Apply FSRS algorithm based on rating
  switch (rating) {
    case "again":
      // Failed recall - reduce stability, increase difficulty, review soon
      newStability = Math.max(1, card.stability * 0.5)
      newDifficulty = Math.min(10, newDifficulty + 2)
      scheduledDays = 0.1 // 2.4 hours
      break

    case "hard":
      // Difficult recall - slight stability increase, slight difficulty increase
      newStability = card.stability * 1.2
      newDifficulty = Math.min(10, newDifficulty + 0.5)
      scheduledDays = Math.max(1, card.stability * 1.2)
      break

    case "good":
      // Normal recall - significant stability increase
      newStability = card.stability === 0 ? 1 : card.stability * 2.5
      scheduledDays = Math.max(1, newStability)
      break

    case "easy":
      // Easy recall - maximum stability increase, reduce difficulty
      newStability = card.stability === 0 ? 4 : card.stability * 4
      newDifficulty = Math.max(1, newDifficulty - 1)
      scheduledDays = Math.max(1, newStability)
      break
  }

  // Calculate next review date
  const dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000)

  // Return updated card
  return {
    ...card,
    stability: newStability,
    difficulty: newDifficulty,
    scheduledDays,
    due: dueDate,
    reps: card.reps + 1,
    lapses: rating === "again" ? card.lapses + 1 : card.lapses,
    state: rating === "again" ? "relearning" : card.state === "new" ? "learning" : "review",
  }
}

/**
 * Calculate the number of days until next review based on current stability and rating
 *
 * This is used for UI preview of scheduling before submitting review
 *
 * @param stability - Current card stability
 * @param rating - Anticipated rating
 * @returns Number of days until next review
 */
export function calculateScheduledDays(stability: number, rating: FSRSRating): number {
  switch (rating) {
    case "again":
      return 0.1 // 2.4 hours
    case "hard":
      return Math.max(1, stability * 1.2)
    case "good":
      return Math.max(1, stability === 0 ? 1 : stability * 2.5)
    case "easy":
      return Math.max(1, stability === 0 ? 4 : stability * 4)
  }
}
