import { useEffect } from 'react'

type Rating = 'again' | 'hard' | 'good' | 'easy'

interface UsePracticeKeyboardOptions {
  showTranslation: boolean
  onShowTranslation: () => void
  onRate: (rating: Rating) => void
}

const KEY_TO_RATING: Record<string, Rating> = {
  '1': 'again',
  '2': 'hard',
  '3': 'good',
  '4': 'easy',
}

export function usePracticeKeyboard({
  showTranslation,
  onShowTranslation,
  onRate,
}: UsePracticeKeyboardOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (!showTranslation) {
        // When translation is hidden, Space reveals it
        if (event.code === 'Space') {
          event.preventDefault()
          onShowTranslation()
        }
      } else {
        // When translation is shown, 1-4 keys trigger ratings
        const rating = KEY_TO_RATING[event.key]
        if (rating) {
          event.preventDefault()
          onRate(rating)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showTranslation, onShowTranslation, onRate])
}
