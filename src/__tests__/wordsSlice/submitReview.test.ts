/// <reference types="jest" />

// Mock fetchWithAuth before any imports that use it
jest.mock('../../utils/fetchWithAuth')

import { submitWordReview } from '../../store/wordsSlice'
import {
  createTestStore,
  createMockWord,
  createSuccessResponse,
  createErrorResponse,
  mockFetchWithAuth,
} from '../../test-utils/wordsSliceHelpers'

describe('wordsSlice - submitWordReview (Critical Business Logic)', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchWithAuth.mockClear()
    store = createTestStore()
  })

  describe('Successful Review Submission', () => {
    it('should submit review and update word state', async () => {
      const mockWord = createMockWord('word-1', {
        stability: 2.5,
        difficulty: 6.0,
        reps: 1,
      })

      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse(mockWord))

      const result = await store.dispatch(
        submitWordReview({ wordId: 'word-1', rating: 'good' })
      )

      expect(result.type).toBe('words/submitReview/fulfilled')
      expect(result.payload).toEqual(mockWord)
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'http://localhost:8080/words/word-1/reviews',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: 'good' }),
        })
      )
    })

    it('should handle all rating types (again, hard, good, easy)', async () => {
      const ratings: Array<'again' | 'hard' | 'good' | 'easy'> = [
        'again',
        'hard',
        'good',
        'easy',
      ]

      for (const rating of ratings) {
        mockFetchWithAuth.mockResolvedValueOnce(
          createSuccessResponse(createMockWord('word-1'))
        )

        const result = await store.dispatch(
          submitWordReview({ wordId: 'word-1', rating })
        )

        expect(result.type).toBe('words/submitReview/fulfilled')
        expect(mockFetchWithAuth).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ rating }),
          })
        )
      }
    })
  })

  describe('Optimistic Updates', () => {
    it('should optimistically decrement wordsCount when review starts', async () => {
      store = createTestStore({
        words: { wordsCount: 10 },
      })

      // Delay the response to capture the optimistic state
      mockFetchWithAuth.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve(createSuccessResponse(createMockWord('word-1'))),
              100
            )
          })
      )

      const dispatchPromise = store.dispatch(
        submitWordReview({ wordId: 'word-1', rating: 'good' })
      )

      // Check optimistic update immediately
      const stateAfterDispatch = store.getState().words
      expect(stateAfterDispatch.wordsCount).toBe(9)
      expect(stateAfterDispatch.isSubmitting).toBe(true)

      // Wait for completion
      await dispatchPromise

      const finalState = store.getState().words
      expect(finalState.isSubmitting).toBe(false)
      expect(finalState.wordsCount).toBe(9) // Should stay at 9
    })

    it('should not decrement wordsCount below zero', async () => {
      store = createTestStore({
        words: { wordsCount: 0 },
      })

      mockFetchWithAuth.mockResolvedValueOnce(
        createSuccessResponse(createMockWord('word-1'))
      )

      await store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' }))

      const state = store.getState().words
      expect(state.wordsCount).toBe(0) // Should not go negative
    })

    it('should not crash when wordsCount is undefined', async () => {
      store = createTestStore({
        words: { wordsCount: undefined },
      })

      mockFetchWithAuth.mockResolvedValueOnce(
        createSuccessResponse(createMockWord('word-1'))
      )

      await store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' }))

      const state = store.getState().words
      expect(state.wordsCount).toBeUndefined() // Should remain undefined
      expect(state.isSubmitting).toBe(false)
    })
  })

  describe('Rollback on Failure', () => {
    it('should rollback optimistic update on network failure', async () => {
      store = createTestStore({
        words: { wordsCount: 10 },
      })

      mockFetchWithAuth.mockRejectedValueOnce(new Error('Network error'))

      const result = await store.dispatch(
        submitWordReview({ wordId: 'word-1', rating: 'good' })
      )

      expect(result.type).toBe('words/submitReview/rejected')

      const state = store.getState().words
      expect(state.wordsCount).toBe(10) // Should be rolled back to 10
      expect(state.isSubmitting).toBe(false)
      expect(state.error).toBe('Network error')
    })

    it('should rollback optimistic update on API error response', async () => {
      store = createTestStore({
        words: { wordsCount: 5 },
      })

      mockFetchWithAuth.mockResolvedValueOnce(createErrorResponse(500))

      const result = await store.dispatch(
        submitWordReview({ wordId: 'word-1', rating: 'good' })
      )

      expect(result.type).toBe('words/submitReview/rejected')

      const state = store.getState().words
      expect(state.wordsCount).toBe(5) // Rolled back from 4 to 5
      expect(state.error).toBe('Failed to submit review')
    })

    it('should handle multiple rapid failures correctly', async () => {
      store = createTestStore({
        words: { wordsCount: 10 },
      })

      mockFetchWithAuth.mockRejectedValue(new Error('Network error'))

      // Submit 3 reviews that all fail
      await store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' }))
      await store.dispatch(submitWordReview({ wordId: 'word-2', rating: 'hard' }))
      await store.dispatch(submitWordReview({ wordId: 'word-3', rating: 'easy' }))

      const state = store.getState().words
      expect(state.wordsCount).toBe(10) // Should still be 10 after all rollbacks
    })
  })

  describe('Loading States', () => {
    it('should set isSubmitting to true during submission', async () => {
      mockFetchWithAuth.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve(createSuccessResponse(createMockWord('word-1'))),
              100
            )
          })
      )

      const dispatchPromise = store.dispatch(
        submitWordReview({ wordId: 'word-1', rating: 'good' })
      )

      expect(store.getState().words.isSubmitting).toBe(true)

      await dispatchPromise

      expect(store.getState().words.isSubmitting).toBe(false)
    })

    it('should clear error state when new submission starts', async () => {
      store = createTestStore({
        words: { error: 'Previous error' },
      })

      mockFetchWithAuth.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve(createSuccessResponse(createMockWord('word-1'))),
              50
            )
          })
      )

      store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' }))

      // Error should be cleared immediately on pending
      expect(store.getState().words.error).toBeNull()
    })
  })
})
