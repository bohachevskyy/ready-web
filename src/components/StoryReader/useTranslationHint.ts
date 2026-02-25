import { useState, useEffect, useCallback, useRef } from "react"

const STORAGE_KEY = "readerly_translation_hint_shown"

/**
 * Hook that manages the "translation hint" feature.
 * On first visit, it selects a random word >5 characters from the story,
 * auto-clicks it to show translation, and displays a tip tooltip.
 * Only shown once per user (persisted in localStorage).
 */
export function useTranslationHint(storyText: string) {
  const [hintWordIndex, setHintWordIndex] = useState<{ start: number; end: number } | null>(null)
  const [showHintTip, setShowHintTip] = useState(false)
  const hasTriggered = useRef(false)

  // Check if hint was already shown
  const wasShown = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true"
    } catch {
      return false
    }
  }, [])

  // Mark hint as shown
  const markShown = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // ignore
    }
  }, [])

  // Find a random word >5 chars and auto-trigger click
  useEffect(() => {
    if (!storyText || hasTriggered.current || wasShown()) return
    hasTriggered.current = true

    // Parse words with positions (same logic as StoryContent)
    const lines = storyText.split('\n')
    let currentPosition = 0
    const candidates: { word: string; start: number; end: number }[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const tokens = line.split(/(\s+|[.,!?;:"""''()[\]{}]+)/)

      for (const token of tokens) {
        if (!token) continue
        const startPos = currentPosition
        const endPos = currentPosition + token.length
        currentPosition = endPos

        // Only consider actual words (not whitespace/punctuation) with >5 chars
        if (!token.match(/^\s+$/) && !token.match(/^[.,!?;:"""''()[\]{}]+$/) && token.length > 5) {
          candidates.push({ word: token, start: startPos, end: endPos })
        }
      }

      if (i < lines.length - 1) {
        currentPosition += 1
      }
    }

    if (candidates.length === 0) return

    // Pick a word from the first two sentences only (visible at top of story)
    const sentenceBreaks = storyText.match(/[.!?]/g)
    let twoSentenceEnd = storyText.length
    if (sentenceBreaks && sentenceBreaks.length >= 1) {
      // Find the position after the second sentence-ending punctuation
      let count = 0
      for (let i = 0; i < storyText.length; i++) {
        if (storyText[i] === '.' || storyText[i] === '!' || storyText[i] === '?') {
          count++
          if (count >= 2) {
            twoSentenceEnd = i + 1
            break
          }
        }
      }
      // If only one sentence, use its end
      if (count === 1) {
        for (let i = 0; i < storyText.length; i++) {
          if (storyText[i] === '.' || storyText[i] === '!' || storyText[i] === '?') {
            twoSentenceEnd = i + 1
            break
          }
        }
      }
    }

    // Filter candidates to only those within the first two sentences
    const earlyCandidates = candidates.filter(c => c.end <= twoSentenceEnd)
    const pool = earlyCandidates.length > 0 ? earlyCandidates : candidates.slice(0, Math.max(1, 3))
    const idx = Math.floor(Math.random() * pool.length)
    const chosen = pool[idx]

    // Show highlight and tip immediately — don't wait for DOM or API
    setHintWordIndex({ start: chosen.start, end: chosen.end })
    setShowHintTip(true)

    // Auto-click the word after a brief delay to let the DOM render
    setTimeout(() => {
      const wordEl = document.querySelector(`[data-start="${chosen.start}"][data-end="${chosen.end}"]`) as HTMLElement
      if (wordEl) {
        wordEl.click()
      }
    }, 500)
  }, [storyText, wasShown])

  const dismissHint = useCallback(() => {
    setShowHintTip(false)
    setHintWordIndex(null)
    markShown()
  }, [markShown])

  return {
    hintWordIndex,
    showHintTip,
    dismissHint,
  }
}
