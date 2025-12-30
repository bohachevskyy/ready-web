/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit'
import wordsReducer, {
  fetchWords,
  fetchWordsCount,
  submitWordReview,
  clearWords,
  nextWord,
  resetIndex,
  setSessionTotal,
} from './wordsSlice'
import authReducer, { clearAuth } from './authSlice'
import { Word } from '../types'

// Mock fetchWithAuth
jest.mock('../utils/fetchWithAuth')

import { fetchWithAuth } from '../utils/fetchWithAuth'
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

// Helper to create a test store
const createTestStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      words: wordsReducer,
      auth: authReducer,
    },
    preloadedState: {
      words: {
        words: [],
        wordsCount: undefined,
        sessionTotal: undefined,
        countLastFetched: null,
        isLoading: false,
        isCountLoading: false,
        isSubmitting: false,
        error: null,
        lastWordId: undefined,
        hasNextPage: true,
        currentIndex: 0,
        ...initialState.words,
      },
      auth: {
        token: 'test-token',
        tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        refreshToken: 'test-refresh-token',
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        user: null,
        isLoading: false,
        error: null,
        networkError: false,
        uiLanguage: null,
        ...initialState.auth,
      },
    },
  })
}

// Helper to create mock words
const createMockWord = (id: string, overrides: Partial<Word> = {}): Word => ({
  id,
  name: `word-${id}`,
  translation: `translation-${id}`,
  sentence_context: `This is a sentence with word-${id}`,
  sentence_translation: `This is a translated sentence`,
  due_at: new Date().toISOString(),
  stability: 1.0,
  difficulty: 5.0,
  elapsed_days: 0,
  scheduled_days: 1,
  reps: 0,
  lapses: 0,
  state: 'New',
  ...overrides,
})

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

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockWord,
        text: async () => JSON.stringify(mockWord),
        headers: new Headers(),
      } as Response)

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
        mockFetchWithAuth.mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => createMockWord('word-1'),
          text: async () => '{}',
          headers: new Headers(),
        } as Response)

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
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  statusText: 'OK',
                  json: async () => createMockWord('word-1'),
                  text: async () => '{}',
                  headers: new Headers(),
                } as Response),
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

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => createMockWord('word-1'),
        text: async () => '{}',
        headers: new Headers(),
      } as Response)

      await store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' }))

      const state = store.getState().words
      expect(state.wordsCount).toBe(0) // Should not go negative
    })

    it('should not crash when wordsCount is undefined', async () => {
      store = createTestStore({
        words: { wordsCount: undefined },
      })

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => createMockWord('word-1'),
        text: async () => '{}',
        headers: new Headers(),
      } as Response)

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

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
        text: async () => '{}',
        headers: new Headers(),
      } as Response)

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
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  statusText: 'OK',
                  json: async () => createMockWord('word-1'),
                  text: async () => '{}',
                  headers: new Headers(),
                } as Response),
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
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  statusText: 'OK',
                  json: async () => createMockWord('word-1'),
                  text: async () => '{}',
                  headers: new Headers(),
                } as Response),
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

describe('wordsSlice - fetchWords (Pagination Logic)', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchWithAuth.mockClear()
    store = createTestStore()
  })

  describe('Initial Fetch', () => {
    it('should fetch initial words and replace empty array', async () => {
      const mockWords = [
        createMockWord('word-1'),
        createMockWord('word-2'),
        createMockWord('word-3'),
      ]

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockWords,
        text: async () => JSON.stringify(mockWords),
        headers: new Headers(),
      } as Response)

      const result = await store.dispatch(fetchWords({ limit: 15 }))

      expect(result.type).toBe('words/fetchWords/fulfilled')
      expect(result.payload).toEqual(mockWords)

      const state = store.getState().words
      expect(state.words).toEqual(mockWords)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should set correct API parameters for training-due words', async () => {
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => [],
        text: async () => '[]',
        headers: new Headers(),
      } as Response)

      await store.dispatch(fetchWords({ limit: 15 }))

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining('filter=training-due')
      )
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining('order=desc')
      )
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining('limit=15')
      )
    })
  })

  describe('Pagination', () => {
    it('should append words when paginating', async () => {
      const initialWords = [createMockWord('word-1'), createMockWord('word-2')]
      const nextWords = [createMockWord('word-3'), createMockWord('word-4')]

      store = createTestStore({
        words: { words: initialWords, lastWordId: 'word-2' },
      })

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => nextWords,
        text: async () => JSON.stringify(nextWords),
        headers: new Headers(),
      } as Response)

      await store.dispatch(fetchWords({ limit: 15, afterId: 'word-2' }))

      const state = store.getState().words
      expect(state.words).toEqual([...initialWords, ...nextWords])
    })

    it('should include afterId parameter when paginating', async () => {
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => [],
        text: async () => '[]',
        headers: new Headers(),
      } as Response)

      await store.dispatch(fetchWords({ limit: 15, afterId: 'word-10' }))

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining('afterId=word-10')
      )
    })

    it('should update lastWordId to last word in response', async () => {
      const mockWords = [
        createMockWord('word-1'),
        createMockWord('word-2'),
        createMockWord('word-3'),
      ]

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockWords,
        text: async () => JSON.stringify(mockWords),
        headers: new Headers(),
      } as Response)

      await store.dispatch(fetchWords({ limit: 15 }))

      const state = store.getState().words
      expect(state.lastWordId).toBe('word-3')
    })
  })

  describe('hasNextPage Logic', () => {
    it('should set hasNextPage to true when receiving 15 words', async () => {
      const mockWords = Array.from({ length: 15 }, (_, i) =>
        createMockWord(`word-${i}`)
      )

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockWords,
        text: async () => JSON.stringify(mockWords),
        headers: new Headers(),
      } as Response)

      await store.dispatch(fetchWords({ limit: 15 }))

      const state = store.getState().words
      expect(state.hasNextPage).toBe(true)
    })

    it('should set hasNextPage to false when receiving less than 15 words', async () => {
      const mockWords = [createMockWord('word-1'), createMockWord('word-2')]

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockWords,
        text: async () => JSON.stringify(mockWords),
        headers: new Headers(),
      } as Response)

      await store.dispatch(fetchWords({ limit: 15 }))

      const state = store.getState().words
      expect(state.hasNextPage).toBe(false)
    })

    it('should set hasNextPage to false when receiving empty array', async () => {
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => [],
        text: async () => '[]',
        headers: new Headers(),
      } as Response)

      await store.dispatch(fetchWords({ limit: 15 }))

      const state = store.getState().words
      expect(state.hasNextPage).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetchWithAuth.mockRejectedValueOnce(new Error('Network failed'))

      const result = await store.dispatch(fetchWords({ limit: 15 }))

      expect(result.type).toBe('words/fetchWords/rejected')

      const state = store.getState().words
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Network failed')
    })

    it('should handle API errors', async () => {
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
        text: async () => '{}',
        headers: new Headers(),
      } as Response)

      const result = await store.dispatch(fetchWords({ limit: 15 }))

      expect(result.type).toBe('words/fetchWords/rejected')
      expect(store.getState().words.error).toBe('Failed to fetch words')
    })
  })
})

describe('wordsSlice - Synchronous Actions', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('nextWord', () => {
    it('should increment currentIndex', () => {
      const mockWords = [
        createMockWord('word-1'),
        createMockWord('word-2'),
        createMockWord('word-3'),
      ]
      store = createTestStore({
        words: { words: mockWords, currentIndex: 0 },
      })

      store.dispatch(nextWord())
      expect(store.getState().words.currentIndex).toBe(1)

      store.dispatch(nextWord())
      expect(store.getState().words.currentIndex).toBe(2)
    })

    it('should not increment beyond words length', () => {
      const mockWords = [createMockWord('word-1'), createMockWord('word-2')]
      store = createTestStore({
        words: { words: mockWords, currentIndex: 1 },
      })

      store.dispatch(nextWord())

      // Should stay at 1 (last index), not go to 2
      expect(store.getState().words.currentIndex).toBe(1)
    })

    it('should handle empty words array', () => {
      store = createTestStore({
        words: { words: [], currentIndex: 0 },
      })

      store.dispatch(nextWord())

      expect(store.getState().words.currentIndex).toBe(0)
    })
  })

  describe('resetIndex', () => {
    it('should reset currentIndex to 0', () => {
      store = createTestStore({
        words: { currentIndex: 5 },
      })

      store.dispatch(resetIndex())

      expect(store.getState().words.currentIndex).toBe(0)
    })
  })

  describe('setSessionTotal', () => {
    it('should set sessionTotal when undefined', () => {
      store.dispatch(setSessionTotal(25))

      expect(store.getState().words.sessionTotal).toBe(25)
    })

    it('should not overwrite existing sessionTotal', () => {
      store = createTestStore({
        words: { sessionTotal: 10 },
      })

      store.dispatch(setSessionTotal(25))

      // Should remain 10, not change to 25
      expect(store.getState().words.sessionTotal).toBe(10)
    })

    it('should prevent mid-session total changes', () => {
      store.dispatch(setSessionTotal(10))
      store.dispatch(setSessionTotal(20))
      store.dispatch(setSessionTotal(30))

      // Should stay at first value (10)
      expect(store.getState().words.sessionTotal).toBe(10)
    })
  })

  describe('clearWords', () => {
    it('should clear all word data while preserving count', () => {
      const mockWords = [createMockWord('word-1'), createMockWord('word-2')]
      store = createTestStore({
        words: {
          words: mockWords,
          wordsCount: 10,
          sessionTotal: 5,
          lastWordId: 'word-2',
          hasNextPage: false,
          currentIndex: 1,
          error: 'Some error',
        },
      })

      store.dispatch(clearWords())

      const state = store.getState().words
      expect(state.words).toEqual([])
      expect(state.sessionTotal).toBeUndefined()
      expect(state.lastWordId).toBeUndefined()
      expect(state.hasNextPage).toBe(true)
      expect(state.currentIndex).toBe(0)
      expect(state.error).toBeNull()

      // Should preserve count for future sessions
      expect(state.wordsCount).toBe(10)
    })
  })
})

describe('wordsSlice - Cross-Slice Integration', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('should clear all data on logout (clearAuth)', () => {
    const mockWords = [createMockWord('word-1'), createMockWord('word-2')]
    store = createTestStore({
      words: {
        words: mockWords,
        wordsCount: 10,
        sessionTotal: 5,
        countLastFetched: Date.now(),
        lastWordId: 'word-2',
        hasNextPage: false,
        currentIndex: 1,
        error: 'Some error',
      },
    })

    store.dispatch(clearAuth())

    const state = store.getState().words
    // Everything should be reset on logout
    expect(state.words).toEqual([])
    expect(state.wordsCount).toBeUndefined()
    expect(state.sessionTotal).toBeUndefined()
    expect(state.countLastFetched).toBeNull()
    expect(state.lastWordId).toBeUndefined()
    expect(state.hasNextPage).toBe(true)
    expect(state.currentIndex).toBe(0)
    expect(state.error).toBeNull()
  })
})

describe('wordsSlice - Edge Cases & Race Conditions', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchWithAuth.mockClear()
    store = createTestStore()
  })

  it('should handle multiple simultaneous review submissions', async () => {
    store = createTestStore({
      words: { wordsCount: 10 },
    })

    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => createMockWord('word-1'),
      text: async () => '{}',
      headers: new Headers(),
    } as Response)

    // Submit 3 reviews simultaneously
    const results = await Promise.all([
      store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' })),
      store.dispatch(submitWordReview({ wordId: 'word-2', rating: 'hard' })),
      store.dispatch(submitWordReview({ wordId: 'word-3', rating: 'easy' })),
    ])

    expect(results.every((r) => r.type === 'words/submitReview/fulfilled')).toBe(
      true
    )

    const state = store.getState().words
    expect(state.wordsCount).toBe(7) // 10 - 3 = 7
  })

  it('should handle mixed success and failure submissions', async () => {
    store = createTestStore({
      words: { wordsCount: 10 },
    })

    mockFetchWithAuth
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => createMockWord('word-1'),
        text: async () => '{}',
        headers: new Headers(),
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => createMockWord('word-3'),
        text: async () => '{}',
        headers: new Headers(),
      } as Response)

    await store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' })) // Success
    await store.dispatch(submitWordReview({ wordId: 'word-2', rating: 'hard' })) // Fail
    await store.dispatch(submitWordReview({ wordId: 'word-3', rating: 'easy' })) // Success

    const state = store.getState().words
    expect(state.wordsCount).toBe(8) // 10 - 2 successful = 8
  })
})
