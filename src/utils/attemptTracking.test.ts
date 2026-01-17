import { incrementAttempt, buildQuestionAttempts, type AttemptCounts } from './attemptTracking'

describe('attemptTracking', () => {
  describe('incrementAttempt', () => {
    it('should initialize count to 1 for new question', () => {
      const prev: AttemptCounts = {}
      const result = incrementAttempt(prev, 'q1')

      expect(result).toEqual({ q1: 1 })
    })

    it('should increment existing count', () => {
      const prev: AttemptCounts = { q1: 2 }
      const result = incrementAttempt(prev, 'q1')

      expect(result).toEqual({ q1: 3 })
    })

    it('should preserve other question counts', () => {
      const prev: AttemptCounts = { q1: 2, q2: 1 }
      const result = incrementAttempt(prev, 'q1')

      expect(result).toEqual({ q1: 3, q2: 1 })
    })

    it('should not mutate the original object', () => {
      const prev: AttemptCounts = { q1: 1 }
      const result = incrementAttempt(prev, 'q1')

      expect(prev).toEqual({ q1: 1 })
      expect(result).toEqual({ q1: 2 })
      expect(result).not.toBe(prev)
    })

    it('should handle multiple different questions', () => {
      let counts: AttemptCounts = {}
      counts = incrementAttempt(counts, 'q1')
      counts = incrementAttempt(counts, 'q2')
      counts = incrementAttempt(counts, 'q1')
      counts = incrementAttempt(counts, 'q3')
      counts = incrementAttempt(counts, 'q1')

      expect(counts).toEqual({ q1: 3, q2: 1, q3: 1 })
    })
  })

  describe('buildQuestionAttempts', () => {
    it('should map questions to attempt counts array', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]
      const attemptCounts: AttemptCounts = { q1: 2, q2: 1, q3: 3 }

      const result = buildQuestionAttempts(questions, attemptCounts)

      expect(result).toEqual([2, 1, 3])
    })

    it('should return 0 for unanswered questions', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]
      const attemptCounts: AttemptCounts = { q1: 1 }

      const result = buildQuestionAttempts(questions, attemptCounts)

      expect(result).toEqual([1, 0, 0])
    })

    it('should handle empty questions array', () => {
      const questions: Array<{ id: string }> = []
      const attemptCounts: AttemptCounts = { q1: 1 }

      const result = buildQuestionAttempts(questions, attemptCounts)

      expect(result).toEqual([])
    })

    it('should handle empty attempt counts', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }]
      const attemptCounts: AttemptCounts = {}

      const result = buildQuestionAttempts(questions, attemptCounts)

      expect(result).toEqual([0, 0])
    })

    it('should preserve question order', () => {
      const questions = [{ id: 'q3' }, { id: 'q1' }, { id: 'q2' }]
      const attemptCounts: AttemptCounts = { q1: 1, q2: 2, q3: 3 }

      const result = buildQuestionAttempts(questions, attemptCounts)

      expect(result).toEqual([3, 1, 2])
    })

    it('should ignore extra attempt counts not in questions', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }]
      const attemptCounts: AttemptCounts = { q1: 1, q2: 2, q3: 3, q4: 4 }

      const result = buildQuestionAttempts(questions, attemptCounts)

      expect(result).toEqual([1, 2])
    })
  })

  describe('integration: typical quiz flow', () => {
    it('should correctly track attempts through a quiz session', () => {
      const questions = [
        { id: 'q1' },
        { id: 'q2' },
        { id: 'q3' },
      ]

      let attemptCounts: AttemptCounts = {}

      // User answers Q1 wrong twice, then correct
      attemptCounts = incrementAttempt(attemptCounts, 'q1')
      attemptCounts = incrementAttempt(attemptCounts, 'q1')
      attemptCounts = incrementAttempt(attemptCounts, 'q1')

      // User answers Q2 correct on first try
      attemptCounts = incrementAttempt(attemptCounts, 'q2')

      // User answers Q3 wrong once, then correct
      attemptCounts = incrementAttempt(attemptCounts, 'q3')
      attemptCounts = incrementAttempt(attemptCounts, 'q3')

      const result = buildQuestionAttempts(questions, attemptCounts)

      expect(result).toEqual([3, 1, 2])
    })
  })
})
