/// <reference types="jest" />

// Mock fetchWithAuth before any imports that use it
jest.mock('../../utils/fetchWithAuth')

import { fetchWords } from '../../store/wordsSlice'
import {
  createTestStore,
  createMockWord,
  createSuccessResponse,
  createErrorResponse,
  mockFetchWithAuth,
} from '../../test-utils/wordsSliceHelpers'

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

      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse(mockWords))

      const result = await store.dispatch(fetchWords({ limit: 15 }))

      expect(result.type).toBe('words/fetchWords/fulfilled')
      expect(result.payload).toEqual(mockWords)

      const state = store.getState().words
      expect(state.words).toEqual(mockWords)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should set correct API parameters for training-due words', async () => {
      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse([]))

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

      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse(nextWords))

      await store.dispatch(fetchWords({ limit: 15, afterId: 'word-2' }))

      const state = store.getState().words
      expect(state.words).toEqual([...initialWords, ...nextWords])
    })

    it('should include afterId parameter when paginating', async () => {
      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse([]))

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

      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse(mockWords))

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

      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse(mockWords))

      await store.dispatch(fetchWords({ limit: 15 }))

      const state = store.getState().words
      expect(state.hasNextPage).toBe(true)
    })

    it('should set hasNextPage to false when receiving less than 15 words', async () => {
      const mockWords = [createMockWord('word-1'), createMockWord('word-2')]

      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse(mockWords))

      await store.dispatch(fetchWords({ limit: 15 }))

      const state = store.getState().words
      expect(state.hasNextPage).toBe(false)
    })

    it('should set hasNextPage to false when receiving empty array', async () => {
      mockFetchWithAuth.mockResolvedValueOnce(createSuccessResponse([]))

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
      mockFetchWithAuth.mockResolvedValueOnce(createErrorResponse(500))

      const result = await store.dispatch(fetchWords({ limit: 15 }))

      expect(result.type).toBe('words/fetchWords/rejected')
      expect(store.getState().words.error).toBe('Failed to fetch words')
    })
  })
})
