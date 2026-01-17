import { renderHook, act } from '@testing-library/react'
import { useQuizState } from './useQuizState'
import type { Question } from '../store/storiesSlice'

describe('useQuizState', () => {
  const mockQuestions: Question[] = [
    { id: 'q1', text: 'Question 1?', options: ['A', 'B', 'C', 'D'], correct_answer: 0 },
    { id: 'q2', text: 'Question 2?', options: ['X', 'Y', 'Z', 'W'], correct_answer: 1 },
    { id: 'q3', text: 'Question 3?', options: ['1', '2', '3', '4'], correct_answer: 2 },
  ]

  const createHookOptions = (overrides = {}) => ({
    questions: mockQuestions,
    onAttempt: jest.fn(),
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty selected answers', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      expect(result.current.selectedAnswers).toEqual({})
    })

    it('should initialize with empty correct answers', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      expect(result.current.correctAnswers).toEqual({})
    })

    it('should initialize with empty incorrect answers', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      expect(result.current.incorrectAnswers).toEqual({})
    })

    it('should initialize with allQuestionsCorrect as false', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      expect(result.current.allQuestionsCorrect).toBe(false)
    })

    it('should prepare shuffled questions', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      expect(result.current.shuffledQuestions).toHaveLength(3)
      expect(result.current.shuffledQuestions[0].id).toBe('q1')
    })
  })

  describe('handleAnswerSelect', () => {
    it('should call onAttempt with question id', () => {
      const onAttempt = jest.fn()
      const { result } = renderHook(() => useQuizState(createHookOptions({ onAttempt })))

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0)
      })

      expect(onAttempt).toHaveBeenCalledWith('q1')
      expect(onAttempt).toHaveBeenCalledTimes(1)
    })

    it('should track selected answer', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 2, 0)
      })

      expect(result.current.selectedAnswers).toEqual({ q1: 2 })
    })

    it('should mark correct answer as correct', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0) // correct answer
      })

      expect(result.current.correctAnswers).toEqual({ q1: true })
      expect(result.current.incorrectAnswers).toEqual({ q1: false })
    })

    it('should mark incorrect answer as incorrect', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 1, 0) // wrong answer
      })

      expect(result.current.incorrectAnswers).toEqual({ q1: true })
      expect(result.current.correctAnswers).toEqual({ q1: false })
    })

    it('should not call onAttempt if question already answered correctly', () => {
      const onAttempt = jest.fn()
      const { result } = renderHook(() => useQuizState(createHookOptions({ onAttempt })))

      // First answer correctly
      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0)
      })

      expect(onAttempt).toHaveBeenCalledTimes(1)

      // Try to answer again
      act(() => {
        result.current.handleAnswerSelect('q1', 1, 0)
      })

      expect(onAttempt).toHaveBeenCalledTimes(1) // Still 1
    })

    it('should allow multiple attempts on incorrect answers', () => {
      const onAttempt = jest.fn()
      const { result } = renderHook(() => useQuizState(createHookOptions({ onAttempt })))

      // First wrong answer
      act(() => {
        result.current.handleAnswerSelect('q1', 1, 0)
      })

      // Second wrong answer
      act(() => {
        result.current.handleAnswerSelect('q1', 2, 0)
      })

      // Third correct answer
      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0)
      })

      expect(onAttempt).toHaveBeenCalledTimes(3)
    })

    it('should track attempts for multiple questions independently', () => {
      const onAttempt = jest.fn()
      const { result } = renderHook(() => useQuizState(createHookOptions({ onAttempt })))

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0)
        result.current.handleAnswerSelect('q2', 1, 1)
        result.current.handleAnswerSelect('q3', 2, 2)
      })

      expect(onAttempt).toHaveBeenCalledWith('q1')
      expect(onAttempt).toHaveBeenCalledWith('q2')
      expect(onAttempt).toHaveBeenCalledWith('q3')
      expect(onAttempt).toHaveBeenCalledTimes(3)
    })
  })

  describe('allQuestionsCorrect', () => {
    it('should be false when no questions answered', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      expect(result.current.allQuestionsCorrect).toBe(false)
    })

    it('should be false when only some questions answered correctly', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0) // correct
        result.current.handleAnswerSelect('q2', 1, 1) // correct
        // q3 not answered
      })

      expect(result.current.allQuestionsCorrect).toBe(false)
    })

    it('should be true when all questions answered correctly', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0) // correct
        result.current.handleAnswerSelect('q2', 1, 1) // correct
        result.current.handleAnswerSelect('q3', 2, 2) // correct
      })

      expect(result.current.allQuestionsCorrect).toBe(true)
    })

    it('should be false when some questions answered incorrectly', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0) // correct
        result.current.handleAnswerSelect('q2', 0, 1) // wrong
        result.current.handleAnswerSelect('q3', 2, 2) // correct
      })

      expect(result.current.allQuestionsCorrect).toBe(false)
    })
  })

  describe('isQuestionAnswered', () => {
    it('should return false for unanswered question', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      expect(result.current.isQuestionAnswered('q1')).toBe(false)
    })

    it('should return false for incorrectly answered question', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 1, 0) // wrong
      })

      expect(result.current.isQuestionAnswered('q1')).toBe(false)
    })

    it('should return true for correctly answered question', () => {
      const { result } = renderHook(() => useQuizState(createHookOptions()))

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0) // correct
      })

      expect(result.current.isQuestionAnswered('q1')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty questions array', () => {
      const { result } = renderHook(() =>
        useQuizState(createHookOptions({ questions: [] }))
      )

      expect(result.current.shuffledQuestions).toEqual([])
      expect(result.current.allQuestionsCorrect).toBe(true) // No questions = all correct
    })

    it('should handle single question', () => {
      const singleQuestion: Question[] = [
        { id: 'q1', text: 'Only question?', options: ['A', 'B'], correct_answer: 0 },
      ]
      const { result } = renderHook(() =>
        useQuizState(createHookOptions({ questions: singleQuestion }))
      )

      expect(result.current.allQuestionsCorrect).toBe(false)

      act(() => {
        result.current.handleAnswerSelect('q1', 0, 0)
      })

      expect(result.current.allQuestionsCorrect).toBe(true)
    })
  })
})
