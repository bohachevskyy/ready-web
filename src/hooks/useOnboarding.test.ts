import { renderHook, act } from '@testing-library/react'
import { useOnboarding, OnboardingStep } from './useOnboarding'

// Mock the analytics service to prevent async issues in tests
jest.mock('../services/analyticsService', () => ({
  logEvent: jest.fn()
}))

const STORAGE_KEY = 'readerly_onboarding_v1'

describe('useOnboarding', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOnboarding())

    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME)
    expect(result.current.isActive).toBe(true)
    expect(result.current.isCompleted).toBe(false)
    expect(result.current.isDismissed).toBe(false)
  })

  it('should load state from localStorage on mount', () => {
    const savedState = {
      currentStep: OnboardingStep.ADD_WORD,
      isCompleted: false,
      isDismissed: false,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

    const { result } = renderHook(() => useOnboarding())

    expect(result.current.currentStep).toBe(OnboardingStep.ADD_WORD)
    expect(result.current.isActive).toBe(true)
  })

  it('should advance to next step on completeCurrentStep', () => {
    const { result } = renderHook(() => useOnboarding())

    act(() => {
      result.current.completeCurrentStep()
    })

    expect(result.current.currentStep).toBe(OnboardingStep.AUTO_NAVIGATE)
  })

  it('should mark as completed when reaching final step', () => {
    const savedState = {
      currentStep: OnboardingStep.PRACTICE_WORDS,
      isCompleted: false,
      isDismissed: false,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

    const { result } = renderHook(() => useOnboarding())

    act(() => {
      result.current.completeCurrentStep()
    })

    expect(result.current.currentStep).toBe(OnboardingStep.COMPLETED)
    expect(result.current.isCompleted).toBe(true)
    expect(result.current.isActive).toBe(false)
  })

  it('should mark as dismissed on skipOnboarding', () => {
    const { result } = renderHook(() => useOnboarding())

    act(() => {
      result.current.skipOnboarding()
    })

    expect(result.current.isDismissed).toBe(true)
    expect(result.current.isActive).toBe(false)
  })

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useOnboarding())

    act(() => {
      result.current.completeCurrentStep()
    })

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).toBeTruthy()

    const parsedState = JSON.parse(stored!)
    expect(parsedState.currentStep).toBe(OnboardingStep.AUTO_NAVIGATE)
  })

  it('should reset onboarding state', () => {
    const savedState = {
      currentStep: OnboardingStep.ADD_WORD,
      isCompleted: false,
      isDismissed: true,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

    const { result } = renderHook(() => useOnboarding())

    act(() => {
      result.current.resetOnboarding()
    })

    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME)
    expect(result.current.isCompleted).toBe(false)
    expect(result.current.isDismissed).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('should correctly identify active steps', () => {
    const { result } = renderHook(() => useOnboarding())

    expect(result.current.isStepActive(OnboardingStep.WELCOME)).toBe(true)
    expect(result.current.isStepActive(OnboardingStep.CLICK_WORD)).toBe(false)

    act(() => {
      result.current.completeCurrentStep()
      result.current.completeCurrentStep()
    })

    expect(result.current.isStepActive(OnboardingStep.CLICK_WORD)).toBe(true)
    expect(result.current.isStepActive(OnboardingStep.WELCOME)).toBe(false)
  })

  it('should not advance when already completed', () => {
    const savedState = {
      currentStep: OnboardingStep.COMPLETED,
      isCompleted: true,
      isDismissed: false,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

    const { result } = renderHook(() => useOnboarding())

    act(() => {
      result.current.completeCurrentStep()
    })

    expect(result.current.currentStep).toBe(OnboardingStep.COMPLETED)
  })

  it('should not advance when dismissed', () => {
    const savedState = {
      currentStep: OnboardingStep.CLICK_WORD,
      isCompleted: false,
      isDismissed: true,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

    const { result } = renderHook(() => useOnboarding())

    act(() => {
      result.current.completeCurrentStep()
    })

    expect(result.current.currentStep).toBe(OnboardingStep.CLICK_WORD)
  })

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json')

    const { result } = renderHook(() => useOnboarding())

    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME)
    expect(result.current.isActive).toBe(true)
  })
})
