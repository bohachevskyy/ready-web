import { useState, useEffect, useCallback } from "react"
import { logEvent } from "../services/analyticsService"

const STORAGE_KEY = "readerly_onboarding_v1"

export enum OnboardingStep {
  WELCOME = 0,
  AUTO_NAVIGATE = 1,
  CLICK_WORD = 2,
  ADD_WORD = 3,
  VIEW_VOCABULARY = 4,
  PRACTICE_WORDS = 5,
  COMPLETED = 6,
}

interface OnboardingState {
  currentStep: OnboardingStep
  isCompleted: boolean
  isDismissed: boolean
}

const DEFAULT_STATE: OnboardingState = {
  currentStep: OnboardingStep.WELCOME,
  isCompleted: false,
  isDismissed: false,
}

/**
 * Hook that manages the user onboarding flow.
 * Uses localStorage to persist state across sessions.
 *
 * Onboarding is skipped for users who have already used the app
 * (determined by checking if they have practice history).
 */
export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingState
        setState(parsed)
      }
    } catch {
      // If parsing fails, use default state
      setState(DEFAULT_STATE)
    }
  }, [])

  // Save state to localStorage whenever it changes
  const saveState = useCallback((newState: OnboardingState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      setState(newState)
    } catch {
      // If storage fails, still update state in memory
      setState(newState)
    }
  }, [])

  // Complete the current step and advance to the next
  const completeCurrentStep = useCallback(() => {
    if (state.isCompleted || state.isDismissed) {
      return
    }

    // Track analytics event
    logEvent('onboarding_step_completed', {
      step: state.currentStep,
      action: 'next'
    })

    const nextStep = state.currentStep + 1
    if (nextStep >= OnboardingStep.COMPLETED) {
      // Mark as completed
      logEvent('onboarding_completed', {
        action: 'next'
      })
      saveState({
        currentStep: OnboardingStep.COMPLETED,
        isCompleted: true,
        isDismissed: false,
      })
    } else {
      // Move to next step
      saveState({
        ...state,
        currentStep: nextStep,
      })
    }
  }, [state, saveState])

  // Skip/dismiss the entire onboarding flow
  const skipOnboarding = useCallback(() => {
    // Track analytics event
    logEvent('onboarding_skipped', {
      step: state.currentStep,
      action: 'skip'
    })

    saveState({
      currentStep: state.currentStep,
      isCompleted: false,
      isDismissed: true,
    })
  }, [state.currentStep, saveState])

  // Jump directly to a specific step (used when manually selecting story)
  const jumpToStep = useCallback((targetStep: OnboardingStep) => {
    if (state.isCompleted || state.isDismissed) {
      return
    }
    saveState({
      ...state,
      currentStep: targetStep,
    })
  }, [state, saveState])

  // Reset onboarding (for testing purposes)
  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setState(DEFAULT_STATE)
    } catch {
      setState(DEFAULT_STATE)
    }
  }, [])

  // Check if a specific step is active
  const isStepActive = useCallback(
    (step: OnboardingStep): boolean => {
      return (
        !state.isCompleted &&
        !state.isDismissed &&
        state.currentStep === step
      )
    },
    [state]
  )

  // Determine if onboarding is active overall
  const isActive = !state.isCompleted && !state.isDismissed

  return {
    currentStep: state.currentStep,
    isActive,
    isCompleted: state.isCompleted,
    isDismissed: state.isDismissed,
    completeCurrentStep,
    skipOnboarding,
    jumpToStep,
    resetOnboarding,
    isStepActive,
  }
}
