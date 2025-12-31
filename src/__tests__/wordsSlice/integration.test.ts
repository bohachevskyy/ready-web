/// <reference types="jest" />

// Mock fetchWithAuth before any imports that use it
jest.mock('../../utils/fetchWithAuth')

import { submitWordReview } from '../../store/wordsSlice'
import { clearAuth } from '../../store/authSlice'
import {
  createTestStore,
  createMockWord,
  createSuccessResponse,
  mockFetchWithAuth,
} from './testUtils'

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

    mockFetchWithAuth.mockResolvedValue(
      createSuccessResponse(createMockWord('word-1'))
    )

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
      .mockResolvedValueOnce(createSuccessResponse(createMockWord('word-1')))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(createSuccessResponse(createMockWord('word-3')))

    await store.dispatch(submitWordReview({ wordId: 'word-1', rating: 'good' })) // Success
    await store.dispatch(submitWordReview({ wordId: 'word-2', rating: 'hard' })) // Fail
    await store.dispatch(submitWordReview({ wordId: 'word-3', rating: 'easy' })) // Success

    const state = store.getState().words
    expect(state.wordsCount).toBe(8) // 10 - 2 successful = 8
  })
})
