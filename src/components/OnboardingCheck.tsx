import { Navigate } from "react-router-dom"
import { useAppSelector } from "../store/store"

interface OnboardingCheckProps {
  children: React.ReactNode
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const user = useAppSelector((state) => state.auth.user)

  // New user detection: missing profile fields
  // Check if user exists and is missing ANY of the required profile fields
  const needsOnboarding = user && (
    user.birth_month === null ||
    user.birth_month === undefined ||
    user.birth_year === null ||
    user.birth_year === undefined ||
    !user.native_language || 
    !user.language_level
  )
  console.log(user)

  // Debug logging
  if (user) {
    console.log('[OnboardingCheck] User profile:', {
      birth_month: user.birth_month,
      birth_year: user.birth_year,
      native_language: user.native_language,
      language_level: user.language_level,
      needsOnboarding
    })
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
