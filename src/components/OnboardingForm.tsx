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
import { cn } from "../lib/utils"

type OnboardingStep = "verify" | "name" | "birthdate" | "language" | "difficulty"

interface OnboardingFormProps {
  onComplete: () => void
}

const ALL_STEPS: OnboardingStep[] = ["verify", "name", "birthdate", "language", "difficulty"]
const SOCIAL_STEPS: OnboardingStep[] = ["birthdate", "language", "difficulty"]

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

  const firebaseUser = auth.currentUser
  const isGoogleOrApple = !!firebaseUser?.providerData.some(
    (provider) => provider.providerId === "google.com" || provider.providerId === "apple.com",
  )

  useEffect(() => {
    if (isGoogleOrApple) {
      setCurrentStep("birthdate")
    }
  }, [isGoogleOrApple])

  const stepFlow = isGoogleOrApple ? SOCIAL_STEPS : ALL_STEPS

  const handleEmailVerified = () => setCurrentStep("name")
  const handleNameNext = () => {
    if (firstName.trim() && lastName.trim()) setCurrentStep("birthdate")
  }
  const handleBirthdateNext = () => {
    if (birthMonth > 0 && birthYear > 0) setCurrentStep("language")
  }
  const handleLanguageSelect = (language: string) => {
    setNativeLanguage(language)
    setCurrentStep("difficulty")
  }
  const handleBackFromName = () => setCurrentStep("verify")
  const handleBackFromBirthdate = () => setCurrentStep("name")
  const handleBackFromLanguage = () => setCurrentStep("birthdate")
  const handleBackFromDifficulty = () => setCurrentStep("language")

  const handleComplete = async () => {
    if (!birthMonth || !birthYear || !nativeLanguage || !languageLevel) {
      setError(t("onboarding.completeAllFields"))
      return
    }

    if (!isGoogleOrApple && (!firstName.trim() || !lastName.trim())) {
      setError(t("onboarding.completeAllFields"))
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
      setError(t("onboarding.failedSaveProfile"))
    }
  }

  const stepIndex = stepFlow.indexOf(currentStep)
  const total = stepFlow.length

  return (
    <div className="w-full flex flex-col items-center">
      {/* Progress dots */}
      <div className="flex justify-center items-center gap-2.5 mb-6">
        {stepFlow.map((_s, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300 ease-out",
              i === stepIndex ? "w-10 bg-green shadow-[0_2px_0_hsl(var(--green-deep))]" : "w-2.5",
              i <= stepIndex ? "bg-green" : "bg-line",
            )}
          />
        ))}
      </div>

      {/* Card */}
      <div
        key={currentStep}
        className="anim-slide w-full max-w-[560px] bg-paper rounded-[22px] border-2 border-line px-8 sm:px-11 py-10"
        style={{ boxShadow: "0 1px 0 rgba(0,0,0,.04), 0 8px 0 hsl(var(--line))" }}
      >
        <div className="text-center mb-8">
          <h1 className="font-black text-[36px] m-0 leading-[1] tracking-tight">
            {t("onboarding.welcome")}
          </h1>
          <div className="text-ink-mute text-sm font-bold mt-1.5">
            {t("onboarding.stepProgress", { current: stepIndex + 1, total })}
          </div>
        </div>

        {currentStep === "verify" && (
          <EmailVerificationStep email={user?.email || ""} onVerified={handleEmailVerified} />
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
            onBack={isGoogleOrApple ? undefined : handleBackFromBirthdate}
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
          <div className="anim-shake mt-4 px-3.5 py-2.5 bg-[#FFE3E6] text-heart-deep border-2 border-[#FFC2C8] rounded-[12px] font-bold text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
