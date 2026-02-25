import { renderHook, act } from "@testing-library/react"
import { useTranslationHint } from "./useTranslationHint"

const STORAGE_KEY = "readerly_translation_hint_shown"

describe("useTranslationHint", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("should not show hint if localStorage flag is set", () => {
    localStorage.setItem(STORAGE_KEY, "true")
    const { result } = renderHook(() => useTranslationHint("Hello wonderful world"))

    act(() => { jest.advanceTimersByTime(1000) })

    expect(result.current.showHintTip).toBe(false)
    expect(result.current.hintWordIndex).toBeNull()
  })

  it("should not show hint if story text is empty", () => {
    const { result } = renderHook(() => useTranslationHint(""))

    act(() => { jest.advanceTimersByTime(1000) })

    expect(result.current.showHintTip).toBe(false)
    expect(result.current.hintWordIndex).toBeNull()
  })

  it("should select a word with >5 characters from first two sentences", () => {
    const storyText = "The beautiful garden was incredible. The flowers bloomed wonderfully. Deep in the forest everything was mysterious."
    const { result } = renderHook(() => useTranslationHint(storyText))

    // Hint shows immediately (no timer needed for highlight/tip)
    expect(result.current.showHintTip).toBe(true)
    expect(result.current.hintWordIndex).not.toBeNull()

    if (result.current.hintWordIndex) {
      const word = storyText.slice(result.current.hintWordIndex.start, result.current.hintWordIndex.end)
      expect(word.length).toBeGreaterThan(5)

      // Word should be from first two sentences (before position of second '.')
      const secondSentenceEnd = storyText.indexOf('.', storyText.indexOf('.') + 1) + 1
      expect(result.current.hintWordIndex.end).toBeLessThanOrEqual(secondSentenceEnd)
    }
  })

  it("should dismiss hint and set localStorage", () => {
    const { result } = renderHook(() => useTranslationHint("The beautiful garden was incredible."))

    expect(result.current.showHintTip).toBe(true)

    act(() => { result.current.dismissHint() })

    expect(result.current.showHintTip).toBe(false)
    expect(result.current.hintWordIndex).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true")
  })
})
