import type { Question } from '../store/storiesSlice'

/**
 * Represents a quiz question with shuffled options and tracked correct answer index
 */
export interface ShuffledQuestion {
  id: string
  text: string
  shuffledOptions: string[]
  correctAnswerIndex: number // Index in the shuffled array where the correct answer is
}

/**
 * Fisher-Yates shuffle algorithm
 * 
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 * Optionally accepts a random function for deterministic testing.
 * 
 * @param array - The array to shuffle
 * @param randomFn - Optional random function (defaults to Math.random)
 * @returns A new shuffled array (does not mutate the original)
 */
export function shuffleArray<T>(
  array: T[],
  randomFn: () => number = Math.random
): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Prepares quiz questions by shuffling options and tracking the correct answer index
 * 
 * For each question, this function:
 * 1. Creates pairs of [option, originalIndex]
 * 2. Shuffles the pairs
 * 3. Finds where the correct answer ended up after shuffling
 * 4. Returns the shuffled options with the new correct answer index
 * 
 * @param questions - Array of questions from the API
 * @param randomFn - Optional random function for deterministic testing
 * @returns Array of shuffled questions with tracked correct answer indices
 */
export function prepareQuizQuestions(
  questions: Question[],
  randomFn: () => number = Math.random
): ShuffledQuestion[] {
  return questions.map(question => {
    // Create array of [option, originalIndex] pairs
    const optionsWithIndices = question.options.map((option, index) => ({
      option,
      originalIndex: index
    }))

    // Shuffle the array
    const shuffledWithIndices = shuffleArray(optionsWithIndices, randomFn)

    // Find where the correct answer ended up after shuffling
    const correctAnswerIndex = shuffledWithIndices.findIndex(
      item => item.originalIndex === question.correct_answer
    )

    return {
      id: question.id,
      text: question.text,
      shuffledOptions: shuffledWithIndices.map(item => item.option),
      correctAnswerIndex
    }
  })
}

/**
 * Checks if all questions have been answered correctly
 * 
 * @param questions - Array of original questions
 * @param correctAnswers - Record of question IDs that have been answered correctly
 * @returns true if all questions are answered correctly, false otherwise
 */
export function checkAllQuestionsCorrect(
  questions: Question[],
  correctAnswers: Record<string, boolean>
): boolean {
  return questions.every(q => correctAnswers[q.id])
}

