import { useState, useMemo, useCallback } from 'react'
import type { Question } from '../store/storiesSlice'
import { prepareQuizQuestions, checkAllQuestionsCorrect } from '../utils/quizUtils'

export interface UseQuizStateOptions {
  questions: Question[]
  onAttempt: (questionId: string) => void
}

export interface UseQuizStateResult {
  shuffledQuestions: ReturnType<typeof prepareQuizQuestions>
  selectedAnswers: Record<string, number>
  incorrectAnswers: Record<string, boolean>
  correctAnswers: Record<string, boolean>
  allQuestionsCorrect: boolean
  handleAnswerSelect: (questionId: string, answerIndex: number, correctAnswer: number) => void
  isQuestionAnswered: (questionId: string) => boolean
}

export function useQuizState({ questions, onAttempt }: UseQuizStateOptions): UseQuizStateResult {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [incorrectAnswers, setIncorrectAnswers] = useState<Record<string, boolean>>({})
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({})

  const shuffledQuestions = useMemo(
    () => prepareQuizQuestions(questions),
    [questions]
  )

  const handleAnswerSelect = useCallback((questionId: string, answerIndex: number, correctAnswer: number) => {
    // Don't process if already answered correctly
    if (correctAnswers[questionId]) {
      return
    }

    onAttempt(questionId)
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }))

    if (answerIndex === correctAnswer) {
      setCorrectAnswers(prev => ({ ...prev, [questionId]: true }))
      setIncorrectAnswers(prev => ({ ...prev, [questionId]: false }))
    } else {
      setIncorrectAnswers(prev => ({ ...prev, [questionId]: true }))
      setCorrectAnswers(prev => ({ ...prev, [questionId]: false }))
    }
  }, [correctAnswers, onAttempt])

  const isQuestionAnswered = useCallback((questionId: string) => {
    return correctAnswers[questionId] === true
  }, [correctAnswers])

  const allQuestionsCorrect = checkAllQuestionsCorrect(questions, correctAnswers)

  return {
    shuffledQuestions,
    selectedAnswers,
    incorrectAnswers,
    correctAnswers,
    allQuestionsCorrect,
    handleAnswerSelect,
    isQuestionAnswered,
  }
}
