import { renderHook, act } from "@testing-library/react"
import { useTranslationHint } from "./useTranslationHint"

const STORAGE_KEY = "readerly_translation_hint_count"

describe("useTranslationHint", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("should show hint on first story open", () => {
    const { result } = renderHook(() => useTranslationHint())
    expect(result.current.showHintTip).toBe(true)
  })

  it("should show hint for the first 5 stories", () => {
    for (let i = 0; i < 5; i++) {
      const { result } = renderHook(() => useTranslationHint())
      expect(result.current.showHintTip).toBe(true)
    }
    expect(localStorage.getItem(STORAGE_KEY)).toBe("5")
  })

  it("should not show hint after 5 stories", () => {
    localStorage.setItem(STORAGE_KEY, "5")
    const { result } = renderHook(() => useTranslationHint())
    expect(result.current.showHintTip).toBe(false)
  })

  it("should dismiss hint when dismissHint is called", () => {
    const { result } = renderHook(() => useTranslationHint())
    expect(result.current.showHintTip).toBe(true)

    act(() => { result.current.dismissHint() })
    expect(result.current.showHintTip).toBe(false)
  })
})
