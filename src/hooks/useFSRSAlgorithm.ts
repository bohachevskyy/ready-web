import { useState, useEffect, useCallback, useMemo } from 'react'
import { Word } from '../types'
import { wordToCard, calculateNextReview, type FSRSCard, type FSRSRating } from '../services/fsrsService'

/**
 * Hook to manage FSRS flashcard logic
 *
 * Handles:
 * - Converting API Words to FSRSCards
 * - Managing local card state (with optimistic UI updates)
 * - Calculating next review on rating
 *
 * @param apiWords - Words from API/Redux
 * @param currentIndex - Current card index
 * @returns Card state and handlers
 */
export function useFSRSAlgorithm(apiWords: Word[], currentIndex: number) {
  // Memoize cards conversion with stable dependency to prevent infinite loops
  // We use a key based on the array content rather than reference
  const wordsKey = useMemo(() =>
    apiWords?.map(w => w.id).join(',') ?? ''
  , [apiWords])

  const initialCards = useMemo(() => {
    return apiWords && apiWords.length > 0 ? apiWords.map(wordToCard) : []
  }, [wordsKey, apiWords])

  const [cards, setCards] = useState<FSRSCard[]>(initialCards)

  // Sync cards when apiWords changes (based on stable wordsKey)
  useEffect(() => {
    setCards(initialCards)
  }, [initialCards])

  /**
   * Handle user rating and update card with optimistic FSRS calculation
   *
   * Note: This is optimistic UI only. The server will perform the authoritative
   * calculation and the component should submit to the API separately.
   *
   * @param rating - User's rating (again, hard, good, easy)
   * @returns Updated card
   */
  const handleRating = useCallback((rating: FSRSRating): FSRSCard => {
    const currentCard = cards[currentIndex]
    const updatedCard = calculateNextReview(currentCard, rating)

    // Update local state optimistically
    const newCards = [...cards]
    newCards[currentIndex] = updatedCard
    setCards(newCards)

    return updatedCard
  }, [cards, currentIndex])

  const currentCard = cards[currentIndex]

  return {
    cards,
    currentCard,
    handleRating,
  }
}
