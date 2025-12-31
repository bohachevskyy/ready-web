/// <reference types="jest" />

import { renderHook, act } from '@testing-library/react'
import { useFSRSAlgorithm } from './useFSRSAlgorithm'
import { Word } from '../types'

describe('useFSRSAlgorithm', () => {
  const createMockWord = (id: string, overrides: Partial<Word> = {}): Word => ({
    id,
    name: `word-${id}`,
    translation: `translation-${id}`,
    sentence_context: `Context for ${id}`,
    sentence_translation: `Translated context for ${id}`,
    due_at: new Date().toISOString(),
    stability: 2.0,
    difficulty: 5.0,
    elapsed_days: 0,
    scheduled_days: 2,
    reps: 0,
    lapses: 0,
    state: 'New',
    ...overrides,
  })

  it('should initialize with empty cards', () => {
    const { result } = renderHook(() => useFSRSAlgorithm([], 0))

    expect(result.current.cards).toEqual([])
    expect(result.current.currentCard).toBeUndefined()
  })

  it('should convert API words to FSRSCards', () => {
    const apiWords = [
      createMockWord('1'),
      createMockWord('2'),
      createMockWord('3'),
    ]

    const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

    expect(result.current.cards).toHaveLength(3)
    expect(result.current.cards[0].id).toBe('1')
    expect(result.current.cards[0].word).toBe('word-1')
    expect(result.current.cards[0].state).toBe('new')
  })

  it('should return current card based on index', () => {
    const apiWords = [
      createMockWord('1'),
      createMockWord('2'),
      createMockWord('3'),
    ]

    const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 1))

    expect(result.current.currentCard.id).toBe('2')
    expect(result.current.currentCard.word).toBe('word-2')
  })

  it('should update cards when apiWords changes', () => {
    const initialWords = [createMockWord('1')]
    const { result, rerender } = renderHook(
      ({ words, index }) => useFSRSAlgorithm(words, index),
      { initialProps: { words: initialWords, index: 0 } }
    )

    expect(result.current.cards).toHaveLength(1)

    const newWords = [createMockWord('1'), createMockWord('2')]
    rerender({ words: newWords, index: 0 })

    expect(result.current.cards).toHaveLength(2)
  })

  it('should clear cards when apiWords becomes empty', () => {
    const initialWords = [createMockWord('1'), createMockWord('2')]
    const { result, rerender } = renderHook(
      ({ words, index }) => useFSRSAlgorithm(words, index),
      { initialProps: { words: initialWords, index: 0 } }
    )

    expect(result.current.cards).toHaveLength(2)

    rerender({ words: [], index: 0 })

    expect(result.current.cards).toEqual([])
  })

  describe('handleRating', () => {
    it('should update card with FSRS calculation on "good" rating', () => {
      const apiWords = [createMockWord('1', { stability: 2.0 })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      act(() => {
        result.current.handleRating('good')
      })

      // Good rating: stability * 2.5
      expect(result.current.cards[0].stability).toBe(5.0)
      expect(result.current.cards[0].reps).toBe(1)
      expect(result.current.cards[0].state).toBe('learning')
    })

    it('should update card with FSRS calculation on "again" rating', () => {
      const apiWords = [createMockWord('1', { stability: 4.0, lapses: 0 })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      act(() => {
        result.current.handleRating('again')
      })

      // Again rating: stability * 0.5 (but min 1), difficulty +2
      expect(result.current.cards[0].stability).toBe(2.0)
      expect(result.current.cards[0].difficulty).toBe(7.0)
      expect(result.current.cards[0].lapses).toBe(1)
      expect(result.current.cards[0].state).toBe('relearning')
    })

    it('should update card with FSRS calculation on "hard" rating', () => {
      const apiWords = [createMockWord('1', { stability: 5.0, difficulty: 5.0 })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      act(() => {
        result.current.handleRating('hard')
      })

      // Hard rating: stability * 1.2, difficulty +0.5
      expect(result.current.cards[0].stability).toBe(6.0)
      expect(result.current.cards[0].difficulty).toBe(5.5)
      expect(result.current.cards[0].state).toBe('learning')
    })

    it('should update card with FSRS calculation on "easy" rating', () => {
      const apiWords = [createMockWord('1', { stability: 3.0, difficulty: 6.0, state: 'Review' })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      act(() => {
        result.current.handleRating('easy')
      })

      // Easy rating: stability * 4, difficulty -1
      expect(result.current.cards[0].stability).toBe(12.0)
      expect(result.current.cards[0].difficulty).toBe(5.0)
      expect(result.current.cards[0].state).toBe('review')
    })

    it('should return the updated card', () => {
      const apiWords = [createMockWord('1')]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      let updatedCard: any

      act(() => {
        updatedCard = result.current.handleRating('good')
      })

      expect(updatedCard).toBeDefined()
      expect(updatedCard.reps).toBe(1)
      expect(updatedCard.state).toBe('learning')
    })

    it('should only update the card at currentIndex', () => {
      const apiWords = [
        createMockWord('1', { stability: 2.0 }),
        createMockWord('2', { stability: 3.0 }),
        createMockWord('3', { stability: 4.0 }),
      ]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 1))

      act(() => {
        result.current.handleRating('good')
      })

      // Only card at index 1 should be updated
      expect(result.current.cards[0].stability).toBe(2.0) // unchanged
      expect(result.current.cards[1].stability).toBe(7.5) // 3.0 * 2.5
      expect(result.current.cards[2].stability).toBe(4.0) // unchanged

      expect(result.current.cards[0].reps).toBe(0) // unchanged
      expect(result.current.cards[1].reps).toBe(1) // incremented
      expect(result.current.cards[2].reps).toBe(0) // unchanged
    })

    it('should handle multiple ratings in sequence', () => {
      const apiWords = [createMockWord('1', { stability: 2.0, difficulty: 5.0 })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      act(() => {
        result.current.handleRating('good')
      })

      expect(result.current.cards[0].stability).toBe(5.0)
      expect(result.current.cards[0].reps).toBe(1)

      act(() => {
        result.current.handleRating('easy')
      })

      // Easy on stability 5.0 = 20.0
      expect(result.current.cards[0].stability).toBe(20.0)
      expect(result.current.cards[0].reps).toBe(2)
      expect(result.current.cards[0].difficulty).toBe(4.0) // 5 - 1
    })

    it('should update scheduledDays based on rating', () => {
      const apiWords = [createMockWord('1', { stability: 10.0 })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      act(() => {
        result.current.handleRating('again')
      })
      expect(result.current.cards[0].scheduledDays).toBe(0.1)

      const apiWords2 = [createMockWord('2', { stability: 10.0 })]
      const { result: result2 } = renderHook(() => useFSRSAlgorithm(apiWords2, 0))

      act(() => {
        result2.current.handleRating('hard')
      })
      expect(result2.current.cards[0].scheduledDays).toBe(12) // max(1, 10 * 1.2)
    })

    it('should update due date based on scheduledDays', () => {
      const apiWords = [createMockWord('1', { stability: 2.0 })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      const beforeTime = Date.now()

      act(() => {
        result.current.handleRating('good')
      })

      const afterTime = Date.now()
      const dueTime = result.current.cards[0].due.getTime()

      // Good rating on stability 2.0 = 5 days
      const expectedMs = 5 * 24 * 60 * 60 * 1000

      expect(dueTime).toBeGreaterThanOrEqual(beforeTime + expectedMs)
      expect(dueTime).toBeLessThanOrEqual(afterTime + expectedMs + 100) // small buffer
    })
  })

  describe('currentCard updates', () => {
    it('should return updated currentCard after rating', () => {
      const apiWords = [createMockWord('1', { stability: 2.0 })]
      const { result } = renderHook(() => useFSRSAlgorithm(apiWords, 0))

      expect(result.current.currentCard.reps).toBe(0)

      act(() => {
        result.current.handleRating('good')
      })

      expect(result.current.currentCard.reps).toBe(1)
      expect(result.current.currentCard.stability).toBe(5.0)
    })

    it('should update currentCard when index changes', () => {
      const apiWords = [
        createMockWord('1'),
        createMockWord('2'),
        createMockWord('3'),
      ]

      const { result, rerender } = renderHook(
        ({ words, index }) => useFSRSAlgorithm(words, index),
        { initialProps: { words: apiWords, index: 0 } }
      )

      expect(result.current.currentCard.id).toBe('1')

      rerender({ words: apiWords, index: 2 })

      expect(result.current.currentCard.id).toBe('3')
    })
  })
})
