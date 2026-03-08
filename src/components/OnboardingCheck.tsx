import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "../store/store"

interface OnboardingCheckProps {
  children: React.ReactNode
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

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

  if (needsOnboarding) {
    const currentPath = location.pathname + location.search
    const onboardingUrl = `/onboarding?redirect=${encodeURIComponent(currentPath)}`
    return <Navigate to={onboardingUrl} replace />
  }

  return <>{children}</>
}
