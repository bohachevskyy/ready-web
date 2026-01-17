import { useEffect } from 'react'

interface CardWithWord {
  word: string
}

interface UseAutoPlayPronunciationProps {
  autoPlayEnabled: boolean
  supported: boolean
  cards: CardWithWord[]
  currentIndex: number
  speechRate: number
  sessionComplete: boolean
  speak: (text: string, options?: { rate?: number }) => void
}

/**
 * Hook that handles auto-play pronunciation when cards change.
 * Plays the current card's word with a 300ms delay for smooth transition.
 * Does NOT play when session is complete to prevent pronunciation on empty screens.
 */
export function useAutoPlayPronunciation({
  autoPlayEnabled,
  supported,
  cards,
  currentIndex,
  speechRate,
  sessionComplete,
  speak,
}: UseAutoPlayPronunciationProps): void {
  useEffect(() => {
    if (
      autoPlayEnabled &&
      supported &&
      cards.length > 0 &&
      cards[currentIndex] &&
      !sessionComplete
    ) {
      const timer = setTimeout(() => {
        speak(cards[currentIndex].word, { rate: speechRate })
      }, 300)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [currentIndex, autoPlayEnabled, supported, cards, speak, speechRate, sessionComplete])
}
