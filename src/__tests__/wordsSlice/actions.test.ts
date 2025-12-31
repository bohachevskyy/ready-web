/// <reference types="jest" />

import {
  nextWord,
  resetIndex,
  setSessionTotal,
  clearWords,
} from '../../store/wordsSlice'
import { createTestStore, createMockWord } from '../../test-utils/wordsSliceHelpers'

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
