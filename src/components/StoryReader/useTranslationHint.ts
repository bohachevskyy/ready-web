import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "readerly_translation_hint_count"
const MAX_SHOWS = 5

/**
 * Hook that manages the "translation hint" tip banner.
 * Shows a reminder ("Tap any word to see its translation") on the first 5
 * stories the user opens, then stops. Uses a counter in localStorage.
 */
export function useTranslationHint() {
  const [showHintTip, setShowHintTip] = useState(false)

  const getCount = useCallback((): number => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0
    } catch {
      return 0
    }
  }, [])

  const incrementCount = useCallback(() => {
    try {
      const current = getCount()
      localStorage.setItem(STORAGE_KEY, String(current + 1))
    } catch {
      // ignore
    }
  }, [getCount])

  useEffect(() => {
    const count = getCount()
    if (count < MAX_SHOWS) {
      setShowHintTip(true)
      incrementCount()
    }
  }, [getCount, incrementCount])

  const dismissHint = useCallback(() => {
    setShowHintTip(false)
  }, [])

  return {
    showHintTip,
    dismissHint,
  }
}
