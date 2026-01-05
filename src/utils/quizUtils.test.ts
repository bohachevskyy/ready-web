/// <reference types="jest" />

import {
  shuffleArray,
  prepareQuizQuestions,
  checkAllQuestionsCorrect,
  type ShuffledQuestion,
} from './quizUtils'
import type { Question } from '../store/storiesSlice'

describe('quizUtils', () => {
  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const input = [1, 2, 3, 4, 5]
      const result = shuffleArray(input)
      
      expect(result).toHaveLength(input.length)
    })

    it('should contain all original elements', () => {
      const input = ['a', 'b', 'c', 'd', 'e']
      const result = shuffleArray(input)
      
      expect(result.sort()).toEqual(input.sort())
    })

    it('should not mutate the original array', () => {
      const input = [1, 2, 3, 4, 5]
      const originalCopy = [...input]
      shuffleArray(input)
      
      expect(input).toEqual(originalCopy)
    })

    it('should handle an empty array', () => {
      const result = shuffleArray([])
      
      expect(result).toEqual([])
    })

    it('should handle a single element array', () => {
      const result = shuffleArray(['only'])
      
      expect(result).toEqual(['only'])
    })

    it('should handle a two element array', () => {
      const input = [1, 2]
      const result = shuffleArray(input)
      
      expect(result).toHaveLength(2)
      expect(result.sort()).toEqual([1, 2])
    })

    it('should use the provided random function for deterministic results', () => {
      const input = [1, 2, 3, 4, 5]
      
      // Create a deterministic "random" function that always returns 0.5
      const deterministicRandom = () => 0.5
      
      const result1 = shuffleArray(input, deterministicRandom)
      const result2 = shuffleArray(input, deterministicRandom)
      
      expect(result1).toEqual(result2)
    })

    it('should produce different orderings with Math.random', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      
      // Run shuffle multiple times and collect results
      const results: number[][] = []
      for (let i = 0; i < 10; i++) {
        results.push(shuffleArray(input))
      }
      
      // Check that not all results are identical (statistically very unlikely)
      const allIdentical = results.every(
        r => JSON.stringify(r) === JSON.stringify(results[0])
      )
      
      expect(allIdentical).toBe(false)
    })

    it('should work with objects', () => {
      const input = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 3, name: 'c' },
      ]
      
      const result = shuffleArray(input)
      
      expect(result).toHaveLength(3)
      expect(result).toContainEqual({ id: 1, name: 'a' })
      expect(result).toContainEqual({ id: 2, name: 'b' })
      expect(result).toContainEqual({ id: 3, name: 'c' })
    })
  })

  describe('prepareQuizQuestions', () => {
    const createMockQuestion = (
      id: string,
      options: string[],
      correctAnswer: number
    ): Question => ({
      id,
      text: `Question ${id}`,
      options,
      correct_answer: correctAnswer,
    })

    it('should return the same number of questions', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['A', 'B', 'C', 'D'], 0),
        createMockQuestion('q2', ['X', 'Y', 'Z'], 2),
      ]
      
      const result = prepareQuizQuestions(questions)
      
      expect(result).toHaveLength(2)
    })

    it('should preserve question id and text', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['A', 'B', 'C'], 1),
      ]
      
      const result = prepareQuizQuestions(questions)
      
      expect(result[0].id).toBe('q1')
      expect(result[0].text).toBe('Question q1')
    })

    it('should contain all original options after shuffling', () => {
      const originalOptions = ['Option A', 'Option B', 'Option C', 'Option D']
      const questions: Question[] = [
        createMockQuestion('q1', originalOptions, 2),
      ]
      
      const result = prepareQuizQuestions(questions)
      
      expect(result[0].shuffledOptions.sort()).toEqual(originalOptions.sort())
    })

    it('should correctly track the correct answer index after shuffling', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['Wrong1', 'Wrong2', 'Correct', 'Wrong3'], 2),
      ]
      
      // Use deterministic random to control shuffle
      let callCount = 0
      const deterministicRandom = () => {
        // Return values that will produce a predictable shuffle
        const values = [0.1, 0.2, 0.3, 0.4, 0.5]
        return values[callCount++ % values.length]
      }
      
      const result = prepareQuizQuestions(questions, deterministicRandom)
      
      // The correct answer should be at the tracked index
      const correctOption = result[0].shuffledOptions[result[0].correctAnswerIndex]
      expect(correctOption).toBe('Correct')
    })

    it('should handle single option question', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['Only Option'], 0),
      ]
      
      const result = prepareQuizQuestions(questions)
      
      expect(result[0].shuffledOptions).toEqual(['Only Option'])
      expect(result[0].correctAnswerIndex).toBe(0)
    })

    it('should handle empty questions array', () => {
      const result = prepareQuizQuestions([])
      
      expect(result).toEqual([])
    })

    it('should handle question with first option as correct', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['Correct', 'Wrong1', 'Wrong2'], 0),
      ]
      
      const result = prepareQuizQuestions(questions)
      
      const correctOption = result[0].shuffledOptions[result[0].correctAnswerIndex]
      expect(correctOption).toBe('Correct')
    })

    it('should handle question with last option as correct', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['Wrong1', 'Wrong2', 'Correct'], 2),
      ]
      
      const result = prepareQuizQuestions(questions)
      
      const correctOption = result[0].shuffledOptions[result[0].correctAnswerIndex]
      expect(correctOption).toBe('Correct')
    })

    it('should shuffle each question independently', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['A', 'B', 'C', 'D'], 0),
        createMockQuestion('q2', ['A', 'B', 'C', 'D'], 0),
      ]
      
      // Run multiple times to verify independence
      let sameOrder = true
      for (let i = 0; i < 5; i++) {
        const result = prepareQuizQuestions(questions)
        if (
          JSON.stringify(result[0].shuffledOptions) !==
          JSON.stringify(result[1].shuffledOptions)
        ) {
          sameOrder = false
          break
        }
      }
      
      // With 4 options, probability of same order is 1/24, so after 5 runs
      // it's extremely unlikely to always be the same
      expect(sameOrder).toBe(false)
    })

    it('should produce consistent results with deterministic random', () => {
      const questions: Question[] = [
        createMockQuestion('q1', ['A', 'B', 'C', 'D'], 1),
      ]
      
      // Use same seed for both calls
      const createSeededRandom = () => {
        let seed = 12345
        return () => {
          seed = (seed * 16807) % 2147483647
          return seed / 2147483647
        }
      }
      
      const result1 = prepareQuizQuestions(questions, createSeededRandom())
      const result2 = prepareQuizQuestions(questions, createSeededRandom())
      
      expect(result1[0].shuffledOptions).toEqual(result2[0].shuffledOptions)
      expect(result1[0].correctAnswerIndex).toBe(result2[0].correctAnswerIndex)
    })
  })

  describe('checkAllQuestionsCorrect', () => {
    const createMockQuestion = (id: string): Question => ({
      id,
      text: `Question ${id}`,
      options: ['A', 'B', 'C'],
      correct_answer: 0,
    })

    it('should return true when all questions are answered correctly', () => {
      const questions: Question[] = [
        createMockQuestion('q1'),
        createMockQuestion('q2'),
        createMockQuestion('q3'),
      ]
      
      const correctAnswers: Record<string, boolean> = {
        q1: true,
        q2: true,
        q3: true,
      }
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(true)
    })

    it('should return false when one question is missing', () => {
      const questions: Question[] = [
        createMockQuestion('q1'),
        createMockQuestion('q2'),
        createMockQuestion('q3'),
      ]
      
      const correctAnswers: Record<string, boolean> = {
        q1: true,
        q2: true,
        // q3 is missing
      }
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(false)
    })

    it('should return false when one question is marked as false', () => {
      const questions: Question[] = [
        createMockQuestion('q1'),
        createMockQuestion('q2'),
      ]
      
      const correctAnswers: Record<string, boolean> = {
        q1: true,
        q2: false, // Marked as incorrect
      }
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(false)
    })

    it('should return true for empty questions array', () => {
      const questions: Question[] = []
      const correctAnswers: Record<string, boolean> = {}
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(true)
    })

    it('should return true for single question answered correctly', () => {
      const questions: Question[] = [createMockQuestion('q1')]
      const correctAnswers: Record<string, boolean> = { q1: true }
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(true)
    })

    it('should return false for single question not answered', () => {
      const questions: Question[] = [createMockQuestion('q1')]
      const correctAnswers: Record<string, boolean> = {}
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(false)
    })

    it('should ignore extra answers in correctAnswers record', () => {
      const questions: Question[] = [
        createMockQuestion('q1'),
        createMockQuestion('q2'),
      ]
      
      const correctAnswers: Record<string, boolean> = {
        q1: true,
        q2: true,
        q3: true, // Extra answer not in questions
        q4: false,
      }
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(true)
    })

    it('should return false when all questions are answered incorrectly', () => {
      const questions: Question[] = [
        createMockQuestion('q1'),
        createMockQuestion('q2'),
      ]
      
      const correctAnswers: Record<string, boolean> = {
        q1: false,
        q2: false,
      }
      
      expect(checkAllQuestionsCorrect(questions, correctAnswers)).toBe(false)
    })
  })
})

