import { renderHook } from '@testing-library/react'
import { usePracticeSession, PracticeSessionState } from './usePracticeSession'

describe('usePracticeSession', () => {
  describe('shouldContinueSession', () => {
    describe('when sessionTotal and wordsCount are defined', () => {
      it('should continue when wordsCount > 0 and not at last card', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 3,
          totalCards: 15,
          sessionTotal: 7,
          wordsCount: 4,
        }
        expect(result.current.shouldContinueSession(state)).toBe(true)
      })

      it('should stop when wordsCount reaches 0, even if more cards available', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 6,
          totalCards: 15,
          sessionTotal: 7,
          wordsCount: 0,
        }
        expect(result.current.shouldContinueSession(state)).toBe(false)
      })

      it('should stop when at last card, even if wordsCount > 0', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 14,
          totalCards: 15,
          sessionTotal: 7,
          wordsCount: 2,
        }
        expect(result.current.shouldContinueSession(state)).toBe(false)
      })

      it('should stop when both wordsCount is 0 and at last card', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 6,
          totalCards: 7,
          sessionTotal: 7,
          wordsCount: 0,
        }
        expect(result.current.shouldContinueSession(state)).toBe(false)
      })

      it('should continue on first card with words remaining', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 0,
          totalCards: 7,
          sessionTotal: 7,
          wordsCount: 7,
        }
        expect(result.current.shouldContinueSession(state)).toBe(true)
      })
    })

    describe('when sessionTotal or wordsCount are undefined', () => {
      it('should continue when not at last card (no sessionTotal)', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 3,
          totalCards: 10,
          sessionTotal: undefined,
          wordsCount: undefined,
        }
        expect(result.current.shouldContinueSession(state)).toBe(true)
      })

      it('should stop when at last card (no sessionTotal)', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 9,
          totalCards: 10,
          sessionTotal: undefined,
          wordsCount: undefined,
        }
        expect(result.current.shouldContinueSession(state)).toBe(false)
      })

      it('should continue when sessionTotal is set but wordsCount is undefined', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 3,
          totalCards: 10,
          sessionTotal: 7,
          wordsCount: undefined,
        }
        expect(result.current.shouldContinueSession(state)).toBe(true)
      })

      it('should continue when wordsCount is set but sessionTotal is undefined', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 3,
          totalCards: 10,
          sessionTotal: undefined,
          wordsCount: 5,
        }
        expect(result.current.shouldContinueSession(state)).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should handle single card session', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 0,
          totalCards: 1,
          sessionTotal: 1,
          wordsCount: 1,
        }
        expect(result.current.shouldContinueSession(state)).toBe(false)
      })

      it('should handle empty session', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 0,
          totalCards: 0,
          sessionTotal: 0,
          wordsCount: 0,
        }
        expect(result.current.shouldContinueSession(state)).toBe(false)
      })
    })

    describe('bug scenario - more cards fetched than session total', () => {
      it('should stop after sessionTotal cards even when more are available', () => {
        const { result } = renderHook(() => usePracticeSession())
        // User planned to review 7 cards, but 15 were fetched
        // After reviewing 7 cards, wordsCount becomes 0
        const state: PracticeSessionState = {
          currentIndex: 6,  // Just reviewed 7th card (0-indexed)
          totalCards: 15,   // More cards were fetched
          sessionTotal: 7,  // User planned to review 7
          wordsCount: 0,    // All planned cards reviewed
        }
        expect(result.current.shouldContinueSession(state)).toBe(false)
      })

      it('should continue before reaching session total', () => {
        const { result } = renderHook(() => usePracticeSession())
        const state: PracticeSessionState = {
          currentIndex: 5,  // On 6th card
          totalCards: 15,   // More cards available
          sessionTotal: 7,  // User planned to review 7
          wordsCount: 2,    // 2 more cards in session
        }
        expect(result.current.shouldContinueSession(state)).toBe(true)
      })
    })
  })
})
