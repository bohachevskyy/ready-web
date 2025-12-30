/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit'
import { submitWordReview, fetchWordsCount } from './wordsSlice'
import wordsReducer from './wordsSlice'
import authReducer from './authSlice'

// Mock fetchWithAuth
jest.mock('../utils/fetchWithAuth')
import { fetchWithAuth } from '../utils/fetchWithAuth'
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('wordsSlice - submitWordReview', () => {
  let store: ReturnType<typeof createTestStore>

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
          countLastFetched: null,
          sessionTotal: undefined,
          lastWordId: undefined,
          hasNextPage: true,
          currentIndex: 0,
          isLoading: false,
          isCountLoading: false,
          isSubmitting: false,
          error: null,
          ...initialState.words,
        },
        auth: {
          token: 'token',
          tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          refreshToken: 'refresh-token',
          refreshTokenExpiresAt: null,
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

  beforeEach(() => {
    jest.clearAllMocks()
    store = createTestStore()
  })

  it('should submit review successfully and return updated word', async () => {
    const updatedWord = {
      id: 'word-1',
      name: 'test',
      translation: 'test translation',
      sentence_context: 'test sentence',
      sentence_translation: 'test sentence translation',
      due_at: new Date(Date.now() + 86400000).toISOString(),
      stability: 5,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 5,
      reps: 1,
      lapses: 0,
      state: 'review',
    }

    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => updatedWord,
    } as Response)

    const result = await store.dispatch(
      submitWordReview({ wordId: 'word-1', rating: 'good' })
    )

    expect(result.type).toBe('words/submitReview/fulfilled')
    expect(result.payload).toEqual(updatedWord)
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      'http://localhost:8080/words/word-1/reviews',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ rating: 'good' }),
      })
    )
  })

  it('should handle all rating types', async () => {
    const ratings = ['again', 'hard', 'good', 'easy'] as const

    for (const rating of ratings) {
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'word-1',
          name: 'test',
          rating,
        }),
      } as Response)

      await store.dispatch(submitWordReview({ wordId: 'word-1', rating }))

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ rating }),
        })
      )
    }
  })

  it('should handle API error response', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid rating' }),
    } as Response)

    const result = await store.dispatch(
      submitWordReview({ wordId: 'word-1', rating: 'invalid' as any })
    )

    expect(result.type).toBe('words/submitReview/rejected')
    expect(result.payload).toBe('Failed to submit review')
  })

  it('should handle network error', async () => {
    mockFetchWithAuth.mockRejectedValueOnce(new Error('Network error'))

    const result = await store.dispatch(
      submitWordReview({ wordId: 'word-1', rating: 'good' })
    )

    expect(result.type).toBe('words/submitReview/rejected')
    expect(result.payload).toBe('Network error')
  })

  it('should update state on pending', () => {
    store.dispatch({ type: 'words/submitReview/pending' })

    const state = store.getState().words
    expect(state.isSubmitting).toBe(true)
  })

  it('should update state on fulfilled', () => {
    const word = {
      id: 'word-1',
      name: 'test',
      translation: 'test',
      sentence_context: 'test',
      sentence_translation: 'test',
      due_at: new Date().toISOString(),
      stability: 5,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 5,
      reps: 1,
      lapses: 0,
      state: 'review',
    }

    store.dispatch({
      type: 'words/submitReview/fulfilled',
      payload: word,
    })

    const state = store.getState().words
    expect(state.isSubmitting).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should update state on rejected', () => {
    store.dispatch({
      type: 'words/submitReview/rejected',
      payload: 'Error message',
    })

    const state = store.getState().words
    expect(state.isSubmitting).toBe(false)
    expect(state.error).toBe('Error message')
  })
})

describe('wordsSlice - fetchWordsCount', () => {
  let store: ReturnType<typeof createTestStore>

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
          countLastFetched: null,
          sessionTotal: undefined,
          lastWordId: undefined,
          hasNextPage: true,
          currentIndex: 0,
          isLoading: false,
          isCountLoading: false,
          isSubmitting: false,
          error: null,
          ...initialState.words,
        },
        auth: {
          token: 'token',
          tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          refreshToken: 'refresh-token',
          refreshTokenExpiresAt: null,
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

  beforeEach(() => {
    jest.clearAllMocks()
    store = createTestStore()
  })

  it('should not dispatch if already loading and force is false', async () => {
    store = createTestStore({
      words: {
        isCountLoading: true,
      },
    })

    const result = await store.dispatch(fetchWordsCount({ force: false }))

    // Should be rejected or not dispatched due to condition
    expect(mockFetchWithAuth).not.toHaveBeenCalled()
  })

  it('should dispatch if force is true even when loading', async () => {
    store = createTestStore({
      words: {
        isCountLoading: true,
      },
    })

    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ count: 10 }),
    } as Response)

    await store.dispatch(fetchWordsCount({ force: true }))

    expect(mockFetchWithAuth).toHaveBeenCalled()
  })
})

