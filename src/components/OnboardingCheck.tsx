import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../store/store"
import { getUserProfile } from "../store/userSlice"
import { setUser } from "../store/authSlice"

interface OnboardingCheckProps {
  children: React.ReactNode
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const userProfile = useAppSelector((state) => state.user.profile)

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

  // Fetch fresh user data when component mounts (after onboarding completes)
  useEffect(() => {
    if (user && !needsOnboarding) {
      dispatch(getUserProfile())
    }
  }, [dispatch, user, needsOnboarding])

  // Update auth state with fresh profile data from backend
  useEffect(() => {
    if (userProfile) {
      dispatch(setUser(userProfile))
    }
  }, [userProfile, dispatch])

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
