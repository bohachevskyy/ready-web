/// <reference types="jest" />

import {
  wordToCard,
  calculateNextReview,
  calculateScheduledDays,
  type FSRSCard,
  type FSRSRating,
} from './fsrsService'
import { Word } from '../types'

describe('fsrsService', () => {
  describe('wordToCard', () => {
    it('should convert API Word to FSRSCard format', () => {
      const apiWord: Word = {
        id: 'word-123',
        name: 'hello',
        translation: 'hola',
        sentence_context: 'Hello, how are you?',
        sentence_translation: 'Hola, ¿cómo estás?',
        due_at: '2024-01-15T10:00:00Z',
        stability: 2.5,
        difficulty: 5.0,
        elapsed_days: 3,
        scheduled_days: 7,
        reps: 5,
        lapses: 1,
        state: 'Review',
      }

      const card = wordToCard(apiWord)

      expect(card).toEqual({
        id: 'word-123',
        word: 'hello',
        translation: 'hola',
        sentenceContext: 'Hello, how are you?',
        sentenceTranslation: 'Hola, ¿cómo estás?',
        due: new Date('2024-01-15T10:00:00Z'),
        stability: 2.5,
        difficulty: 5.0,
        elapsedDays: 3,
        scheduledDays: 7,
        reps: 5,
        lapses: 1,
        state: 'review',
      })
    })

    it('should handle missing optional fields', () => {
      const apiWord: Word = {
        id: 'word-456',
        name: 'test',
        due_at: '2024-01-15T10:00:00Z',
        stability: 1.0,
        difficulty: 5.0,
        elapsed_days: 0,
        scheduled_days: 1,
        reps: 0,
        lapses: 0,
      }

      const card = wordToCard(apiWord)

      expect(card.translation).toBeUndefined()
      expect(card.sentenceContext).toBeUndefined()
      expect(card.sentenceTranslation).toBeUndefined()
      expect(card.state).toBe('new')
    })

    it('should handle state case conversion', () => {
      const states: Array<Word['state']> = ['New', 'Learning', 'Review', 'Relearning', undefined]
      const expectedStates = ['new', 'learning', 'review', 'relearning', 'new']

      states.forEach((state, index) => {
        const apiWord: Word = {
          id: `word-${index}`,
          name: 'test',
          due_at: '2024-01-15T10:00:00Z',
          stability: 1.0,
          difficulty: 5.0,
          elapsed_days: 0,
          scheduled_days: 1,
          reps: 0,
          lapses: 0,
          state,
        }

        const card = wordToCard(apiWord)
        expect(card.state).toBe(expectedStates[index])
      })
    })
  })

  describe('calculateNextReview', () => {
    const createMockCard = (overrides: Partial<FSRSCard> = {}): FSRSCard => ({
      id: 'card-1',
      word: 'test',
      translation: 'prueba',
      sentenceContext: 'This is a test',
      sentenceTranslation: 'Esta es una prueba',
      due: new Date(),
      stability: 2.0,
      difficulty: 5.0,
      elapsedDays: 0,
      scheduledDays: 2,
      reps: 3,
      lapses: 0,
      state: 'review',
      ...overrides,
    })

    describe('Rating: again', () => {
      it('should reduce stability by 50%', () => {
        const card = createMockCard({ stability: 10 })
        const result = calculateNextReview(card, 'again')

        expect(result.stability).toBe(5) // 10 * 0.5
      })

      it('should not reduce stability below 1', () => {
        const card = createMockCard({ stability: 1.5 })
        const result = calculateNextReview(card, 'again')

        expect(result.stability).toBe(1) // Math.max(1, 1.5 * 0.5)
      })

      it('should increase difficulty by 2', () => {
        const card = createMockCard({ difficulty: 5 })
        const result = calculateNextReview(card, 'again')

        expect(result.difficulty).toBe(7) // 5 + 2
      })

      it('should not increase difficulty above 10', () => {
        const card = createMockCard({ difficulty: 9 })
        const result = calculateNextReview(card, 'again')

        expect(result.difficulty).toBe(10) // Math.min(10, 9 + 2)
      })

      it('should schedule review in 0.1 days (2.4 hours)', () => {
        const card = createMockCard()
        const result = calculateNextReview(card, 'again')

        expect(result.scheduledDays).toBe(0.1)
      })

      it('should increment lapses', () => {
        const card = createMockCard({ lapses: 2 })
        const result = calculateNextReview(card, 'again')

        expect(result.lapses).toBe(3)
      })

      it('should set state to relearning', () => {
        const card = createMockCard({ state: 'review' })
        const result = calculateNextReview(card, 'again')

        expect(result.state).toBe('relearning')
      })

      it('should increment reps', () => {
        const card = createMockCard({ reps: 5 })
        const result = calculateNextReview(card, 'again')

        expect(result.reps).toBe(6)
      })
    })

    describe('Rating: hard', () => {
      it('should increase stability by 20%', () => {
        const card = createMockCard({ stability: 10 })
        const result = calculateNextReview(card, 'hard')

        expect(result.stability).toBe(12) // 10 * 1.2
      })

      it('should increase difficulty by 0.5', () => {
        const card = createMockCard({ difficulty: 5 })
        const result = calculateNextReview(card, 'hard')

        expect(result.difficulty).toBe(5.5)
      })

      it('should not increase difficulty above 10', () => {
        const card = createMockCard({ difficulty: 9.8 })
        const result = calculateNextReview(card, 'hard')

        expect(result.difficulty).toBe(10) // Math.min(10, 9.8 + 0.5)
      })

      it('should schedule review at stability * 1.2 days', () => {
        const card = createMockCard({ stability: 5 })
        const result = calculateNextReview(card, 'hard')

        expect(result.scheduledDays).toBe(6) // Math.max(1, 5 * 1.2)
      })

      it('should schedule at least 1 day for low stability', () => {
        const card = createMockCard({ stability: 0.5 })
        const result = calculateNextReview(card, 'hard')

        expect(result.scheduledDays).toBe(1) // Math.max(1, 0.5 * 1.2)
      })

      it('should not increment lapses', () => {
        const card = createMockCard({ lapses: 2 })
        const result = calculateNextReview(card, 'hard')

        expect(result.lapses).toBe(2)
      })

      it('should maintain state for non-new cards', () => {
        const card = createMockCard({ state: 'review' })
        const result = calculateNextReview(card, 'hard')

        expect(result.state).toBe('review')
      })

      it('should transition new cards to learning', () => {
        const card = createMockCard({ state: 'new' })
        const result = calculateNextReview(card, 'hard')

        expect(result.state).toBe('learning')
      })
    })

    describe('Rating: good', () => {
      it('should increase stability by 2.5x', () => {
        const card = createMockCard({ stability: 4 })
        const result = calculateNextReview(card, 'good')

        expect(result.stability).toBe(10) // 4 * 2.5
      })

      it('should set stability to 1 for zero stability cards', () => {
        const card = createMockCard({ stability: 0 })
        const result = calculateNextReview(card, 'good')

        expect(result.stability).toBe(1)
      })

      it('should not change difficulty', () => {
        const card = createMockCard({ difficulty: 5 })
        const result = calculateNextReview(card, 'good')

        expect(result.difficulty).toBe(5)
      })

      it('should schedule review at new stability days', () => {
        const card = createMockCard({ stability: 4 })
        const result = calculateNextReview(card, 'good')

        expect(result.scheduledDays).toBe(10) // Math.max(1, 4 * 2.5)
      })

      it('should schedule at least 1 day', () => {
        const card = createMockCard({ stability: 0.2 })
        const result = calculateNextReview(card, 'good')

        expect(result.scheduledDays).toBe(1) // Math.max(1, 0.2 * 2.5)
      })

      it('should transition new cards to learning', () => {
        const card = createMockCard({ state: 'new' })
        const result = calculateNextReview(card, 'good')

        expect(result.state).toBe('learning')
      })
    })

    describe('Rating: easy', () => {
      it('should increase stability by 4x', () => {
        const card = createMockCard({ stability: 3 })
        const result = calculateNextReview(card, 'easy')

        expect(result.stability).toBe(12) // 3 * 4
      })

      it('should set stability to 4 for zero stability cards', () => {
        const card = createMockCard({ stability: 0 })
        const result = calculateNextReview(card, 'easy')

        expect(result.stability).toBe(4)
      })

      it('should decrease difficulty by 1', () => {
        const card = createMockCard({ difficulty: 6 })
        const result = calculateNextReview(card, 'easy')

        expect(result.difficulty).toBe(5)
      })

      it('should not decrease difficulty below 1', () => {
        const card = createMockCard({ difficulty: 1 })
        const result = calculateNextReview(card, 'easy')

        expect(result.difficulty).toBe(1) // Math.max(1, 1 - 1)
      })

      it('should schedule review at new stability days', () => {
        const card = createMockCard({ stability: 3 })
        const result = calculateNextReview(card, 'easy')

        expect(result.scheduledDays).toBe(12) // Math.max(1, 3 * 4)
      })
    })

    describe('New cards', () => {
      it('should initialize difficulty to 5 for new cards', () => {
        const card = createMockCard({ state: 'new', difficulty: 0 })
        const result = calculateNextReview(card, 'good')

        expect(result.difficulty).toBe(5)
      })

      it('should initialize difficulty for all ratings', () => {
        const ratings: FSRSRating[] = ['again', 'hard', 'good', 'easy']

        ratings.forEach((rating) => {
          const card = createMockCard({ state: 'new', difficulty: 0 })
          const result = calculateNextReview(card, rating)

          // Difficulty should be 5 or adjusted from 5 based on rating
          if (rating === 'again') {
            expect(result.difficulty).toBe(7) // 5 + 2
          } else if (rating === 'hard') {
            expect(result.difficulty).toBe(5.5) // 5 + 0.5
          } else if (rating === 'good') {
            expect(result.difficulty).toBe(5) // 5 (unchanged)
          } else if (rating === 'easy') {
            expect(result.difficulty).toBe(4) // 5 - 1
          }
        })
      })
    })

    describe('Due date calculation', () => {
      it('should set due date based on scheduled days', () => {
        const card = createMockCard({ stability: 2 })
        const beforeTime = Date.now()
        const result = calculateNextReview(card, 'good')
        const afterTime = Date.now()

        const expectedDays = 5 // stability 2 * 2.5 = 5
        const expectedMs = expectedDays * 24 * 60 * 60 * 1000

        const dueTime = result.due.getTime()
        expect(dueTime).toBeGreaterThanOrEqual(beforeTime + expectedMs)
        expect(dueTime).toBeLessThanOrEqual(afterTime + expectedMs)
      })

      it('should calculate correct due date for short intervals', () => {
        const card = createMockCard()
        const beforeTime = Date.now()
        const result = calculateNextReview(card, 'again')
        const afterTime = Date.now()

        const expectedMs = 0.1 * 24 * 60 * 60 * 1000 // 2.4 hours

        const dueTime = result.due.getTime()
        expect(dueTime).toBeGreaterThanOrEqual(beforeTime + expectedMs)
        expect(dueTime).toBeLessThanOrEqual(afterTime + expectedMs)
      })
    })
  })

  describe('calculateScheduledDays', () => {
    it('should calculate scheduled days for "again" rating', () => {
      expect(calculateScheduledDays(5, 'again')).toBe(0.1)
      expect(calculateScheduledDays(0, 'again')).toBe(0.1)
    })

    it('should calculate scheduled days for "hard" rating', () => {
      expect(calculateScheduledDays(5, 'hard')).toBe(6) // 5 * 1.2
      expect(calculateScheduledDays(0.5, 'hard')).toBe(1) // Math.max(1, 0.5 * 1.2)
    })

    it('should calculate scheduled days for "good" rating', () => {
      expect(calculateScheduledDays(4, 'good')).toBe(10) // 4 * 2.5
      expect(calculateScheduledDays(0, 'good')).toBe(1) // Math.max(1, 1)
      expect(calculateScheduledDays(0.2, 'good')).toBe(1) // Math.max(1, 0.2 * 2.5)
    })

    it('should calculate scheduled days for "easy" rating', () => {
      expect(calculateScheduledDays(3, 'easy')).toBe(12) // 3 * 4
      expect(calculateScheduledDays(0, 'easy')).toBe(4) // 4
      expect(calculateScheduledDays(0.1, 'easy')).toBe(1) // Math.max(1, 0.1 * 4)
    })

    it('should always return at least 1 day except for again', () => {
      const ratings: FSRSRating[] = ['hard', 'good', 'easy']

      ratings.forEach((rating) => {
        expect(calculateScheduledDays(0.001, rating)).toBeGreaterThanOrEqual(1)
      })
    })
  })
})
