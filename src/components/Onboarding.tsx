import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../store/store"
import { setUser } from "../store/authSlice"
import { useUpdateUserProfileMutation } from "../services/userApi"
import { Card } from "./ui/card"
import { EmailVerificationStep } from "./onboarding/EmailVerificationStep"
import { BirthdateStep } from "./onboarding/BirthdateStep"
import { LanguageStep } from "./onboarding/LanguageStep"
import { DifficultyStep } from "./onboarding/DifficultyStep"
import { auth } from "../config/firebase"

type OnboardingStep = "verify" | "birthdate" | "language" | "difficulty"

export function Onboarding() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [updateProfile, { isLoading }] = useUpdateUserProfileMutation()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("verify")
  const [birthMonth, setBirthMonth] = useState<number>(user?.birth_month || 0)
  const [birthYear, setBirthYear] = useState<number>(user?.birth_year || 0)
  const [nativeLanguage, setNativeLanguage] = useState<string>(user?.native_language || "")
  const [languageLevel, setLanguageLevel] = useState<number>(user?.language_level || 3)
  const [error, setError] = useState<string | null>(null)

  // Determine if user used Google/Apple (skip email verification)
  useEffect(() => {
    const firebaseUser = auth.currentUser
    if (firebaseUser) {
      const isGoogleOrApple = firebaseUser.providerData.some(
        (provider) => provider.providerId === "google.com" || provider.providerId === "apple.com"
      )
      if (isGoogleOrApple) {
        setCurrentStep("birthdate")
      }
    }
  }, [])

  const handleEmailVerified = () => {
    setCurrentStep("birthdate")
  }

  const handleResendEmail = () => {
    // Backend handles email sending, just show a message
    console.log("Resend email requested")
  }

  const handleBirthdateNext = () => {
    if (birthMonth > 0 && birthYear > 0) {
      setCurrentStep("language")
    }
  }

  const handleLanguageSelect = (language: string) => {
    setNativeLanguage(language)
    setCurrentStep("difficulty")
  }

  const handleComplete = async () => {
    // Validation
    if (!birthMonth || !birthYear || !nativeLanguage || !languageLevel) {
      setError("Please complete all fields")
      return
    }

    setError(null)

    try {
      // Single API call with all data
      const result = await updateProfile({
        birth_month: birthMonth,
        birth_year: birthYear,
        native_language: nativeLanguage,
        language_level: languageLevel,
      }).unwrap()

      // Update Redux with backend response
      dispatch(setUser(result.user))

      // Navigate to home
      navigate("/")
    } catch (err) {
      console.error("Failed to save profile:", err)
      setError("Failed to save profile. Please try again.")
    }
  }

  const handleBackFromBirthdate = () => {
    setCurrentStep("verify")
  }

  const handleBackFromLanguage = () => {
    setCurrentStep("birthdate")
  }

  const handleBackFromDifficulty = () => {
    setCurrentStep("language")
  }

  const getStepNumber = () => {
    const steps: OnboardingStep[] = ["verify", "birthdate", "language", "difficulty"]
    return steps.indexOf(currentStep) + 1
  }

  const getTotalSteps = () => {
    // Check if we skipped verification
    const firebaseUser = auth.currentUser
    if (firebaseUser) {
      const isGoogleOrApple = firebaseUser.providerData.some(
        (provider) => provider.providerId === "google.com" || provider.providerId === "apple.com"
      )
      return isGoogleOrApple ? 3 : 4
    }
    return 4
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 bg-card shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome</h1>
          <p className="text-muted-foreground">
            Step {getStepNumber()} of {getTotalSteps()}
          </p>
        </div>

        {currentStep === "verify" && (
          <EmailVerificationStep
            email={user?.email || ""}
            onVerified={handleEmailVerified}
            onResendEmail={handleResendEmail}
          />
        )}

        {currentStep === "birthdate" && (
          <BirthdateStep
            birthMonth={birthMonth}
            birthYear={birthYear}
            onMonthChange={setBirthMonth}
            onYearChange={setBirthYear}
            onNext={handleBirthdateNext}
            onBack={currentStep !== "birthdate" || auth.currentUser?.providerData.some(
              (p) => p.providerId === "google.com" || p.providerId === "apple.com"
            ) ? undefined : handleBackFromBirthdate}
          />
        )}

        {currentStep === "language" && (
          <LanguageStep
            selectedLanguage={nativeLanguage}
            onLanguageSelect={handleLanguageSelect}
            onBack={handleBackFromLanguage}
          />
        )}

        {currentStep === "difficulty" && (
          <DifficultyStep
            languageLevel={languageLevel}
            onLevelChange={setLanguageLevel}
            onComplete={handleComplete}
            onBack={handleBackFromDifficulty}
            isLoading={isLoading}
          />
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
            {error}
          </div>
        )}
      </Card>
    </div>
  )
}
