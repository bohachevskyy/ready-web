import { useCallback } from 'react'

export interface PracticeSessionState {
  currentIndex: number
  totalCards: number
  sessionTotal?: number
  wordsCount?: number
}

/**
 * Hook for managing practice session flow
 */
export function usePracticeSession() {
  /**
   * Determines if the practice session should continue to the next card
   * or complete.
   *
   * When a session goal (sessionTotal) is set, the session completes when
   * the remaining words count reaches 0, preventing the user from reviewing
   * more words than initially planned even if more cards were prefetched.
   *
   * @param state - Current practice session state
   * @returns true if should continue to next card, false if session should complete
   */
  const shouldContinueSession = useCallback((state: PracticeSessionState): boolean => {
    const { currentIndex, totalCards, sessionTotal, wordsCount } = state

    // If we have a session goal (sessionTotal), complete when wordsCount reaches 0
    // This ensures we don't review more cards than initially planned
    if (sessionTotal !== undefined && wordsCount !== undefined) {
      return wordsCount > 0 && currentIndex < totalCards - 1
    }

    // Otherwise, complete when we've reviewed all cards
    return currentIndex < totalCards - 1
  }, [])

  return {
    shouldContinueSession,
  }
}
