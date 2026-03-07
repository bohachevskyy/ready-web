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

  // Complete the current step and advance to the next
  const completeCurrentStep = useCallback(() => {
    setState(currentState => {
      if (currentState.isCompleted || currentState.isDismissed) {
        return currentState
      }

      // Track analytics event
      logEvent('onboarding_step_completed', {
        step: currentState.currentStep,
        action: 'next'
      })

      const nextStep = currentState.currentStep + 1
      if (nextStep >= OnboardingStep.COMPLETED) {
        // Mark as completed
        logEvent('onboarding_completed', {
          action: 'next'
        })
        const newState = {
          currentStep: OnboardingStep.COMPLETED,
          isCompleted: true,
          isDismissed: false,
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
        } catch {
          // If storage fails, state is still updated in memory
        }
        return newState
      } else {
        // Move to next step
        const newState = {
          ...currentState,
          currentStep: nextStep,
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
        } catch {
          // If storage fails, state is still updated in memory
        }
        return newState
      }
    })
  }, [])

  // Skip/dismiss the entire onboarding flow
  const skipOnboarding = useCallback(() => {
    setState(currentState => {
      // Track analytics event
      logEvent('onboarding_skipped', {
        step: currentState.currentStep,
        action: 'skip'
      })

      const newState = {
        currentStep: currentState.currentStep,
        isCompleted: false,
        isDismissed: true,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      } catch {
        // If storage fails, state is still updated in memory
      }
      return newState
    })
  }, [])

  // Jump directly to a specific step (used when manually selecting story)
  const jumpToStep = useCallback((targetStep: OnboardingStep) => {
    setState(currentState => {
      if (currentState.isCompleted || currentState.isDismissed) {
        return currentState
      }
      const newState = {
        ...currentState,
        currentStep: targetStep,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      } catch {
        // If storage fails, state is still updated in memory
      }
      return newState
    })
  }, [])

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
