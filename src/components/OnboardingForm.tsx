import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../store/store"
import { setUser } from "../store/authSlice"
import { updateUserProfile, getUserProfile } from "../store/userSlice"
import { EmailVerificationStep } from "./onboarding/EmailVerificationStep"
import { NameStep } from "./onboarding/NameStep"
import { BirthdateStep } from "./onboarding/BirthdateStep"
import { LanguageStep } from "./onboarding/LanguageStep"
import { DifficultyStep } from "./onboarding/DifficultyStep"
import { auth } from "../config/firebase"
import { useTranslation } from "../i18n/useTranslation"

type OnboardingStep = "verify" | "name" | "birthdate" | "language" | "difficulty"

interface OnboardingFormProps {
  onComplete: () => void
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const isUpdating = useAppSelector((state) => state.user.isUpdating)
  const { t } = useTranslation()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("verify")
  const [firstName, setFirstName] = useState<string>(user?.first_name || "")
  const [lastName, setLastName] = useState<string>(user?.last_name || "")
  const [birthMonth, setBirthMonth] = useState<number>(user?.birth_month || 0)
  const [birthYear, setBirthYear] = useState<number>(user?.birth_year || 0)
  const [nativeLanguage, setNativeLanguage] = useState<string>(user?.native_language || "")
  const [languageLevel, setLanguageLevel] = useState<number>(user?.language_level || 3)
  const [error, setError] = useState<string | null>(null)

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
    setCurrentStep("name")
  }

  const handleNameNext = () => {
    if (firstName.trim().length > 0 && lastName.trim().length > 0) {
      setCurrentStep("birthdate")
    }
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
    if (!birthMonth || !birthYear || !nativeLanguage || !languageLevel) {
      setError(t('onboarding.completeAllFields'))
      return
    }

    const firebaseUser = auth.currentUser
    const isGoogleOrApple = firebaseUser?.providerData.some(
      (provider) => provider.providerId === "google.com" || provider.providerId === "apple.com"
    )

    if (!isGoogleOrApple && (!firstName.trim() || !lastName.trim())) {
      setError(t('onboarding.completeAllFields'))
      return
    }

    setError(null)

    try {
      const profileData: {
        first_name?: string
        last_name?: string
        birth_month: number
        birth_year: number
        native_language: string
        language_level: number
      } = {
        birth_month: birthMonth,
        birth_year: birthYear,
        native_language: nativeLanguage,
        language_level: languageLevel,
      }

      if (!isGoogleOrApple) {
        profileData.first_name = firstName.trim()
        profileData.last_name = lastName.trim()
      }

      const result = await dispatch(updateUserProfile(profileData)).unwrap()
      dispatch(setUser(result.user))

      const freshProfile = await dispatch(getUserProfile()).unwrap()
      dispatch(setUser(freshProfile))

      onComplete()
    } catch (err) {
      console.error("Failed to save profile:", err)
      setError(t('onboarding.failedSaveProfile'))
    }
  }

  const handleBackFromName = () => {
    setCurrentStep("verify")
  }

  const handleBackFromBirthdate = () => {
    setCurrentStep("name")
  }

  const handleBackFromLanguage = () => {
    setCurrentStep("birthdate")
  }

  const handleBackFromDifficulty = () => {
    setCurrentStep("language")
  }

  const getStepNumber = () => {
    const firebaseUser = auth.currentUser
    const isGoogleOrApple = firebaseUser?.providerData.some(
      (provider) => provider.providerId === "google.com" || provider.providerId === "apple.com"
    )

    if (isGoogleOrApple) {
      const steps: OnboardingStep[] = ["birthdate", "language", "difficulty"]
      return steps.indexOf(currentStep) + 1
    } else {
      const steps: OnboardingStep[] = ["verify", "name", "birthdate", "language", "difficulty"]
      return steps.indexOf(currentStep) + 1
    }
  }

  const getTotalSteps = () => {
    const firebaseUser = auth.currentUser
    if (firebaseUser) {
      const isGoogleOrApple = firebaseUser.providerData.some(
        (provider) => provider.providerId === "google.com" || provider.providerId === "apple.com"
      )
      return isGoogleOrApple ? 3 : 5
    }
    return 5
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('onboarding.welcome')}</h1>
        <p className="text-muted-foreground">
          {t('onboarding.stepProgress', { current: getStepNumber(), total: getTotalSteps() })}
        </p>
      </div>

      {currentStep === "verify" && (
        <EmailVerificationStep
          email={user?.email || ""}
          onVerified={handleEmailVerified}
        />
      )}

      {currentStep === "name" && (
        <NameStep
          firstName={firstName}
          lastName={lastName}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onNext={handleNameNext}
          onBack={handleBackFromName}
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
          isLoading={isUpdating}
        />
      )}

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
          {error}
        </div>
      )}
    </>
  )
}
