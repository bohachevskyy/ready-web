/**
 * Utility functions for tracking quiz question attempts
 */

export type AttemptCounts = Record<string, number>

/**
 * Increments the attempt count for a specific question
 * @param prev - Previous attempt counts record
 * @param questionId - ID of the question to increment
 * @returns New attempt counts record with incremented count
 */
export function incrementAttempt(
  prev: AttemptCounts,
  questionId: string
): AttemptCounts {
  return {
    ...prev,
    [questionId]: (prev[questionId] || 0) + 1
  }
}

/**
 * Builds an array of attempt counts for feedback submission
 * @param questions - Array of questions with id property
 * @param attemptCounts - Record of question ID to attempt count
 * @returns Array of attempt counts in question order
 */
export function buildQuestionAttempts(
  questions: Array<{ id: string }>,
  attemptCounts: AttemptCounts
): number[] {
  return questions.map(q => attemptCounts[q.id] || 0)
}
