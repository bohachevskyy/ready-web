import { useRef } from "react"
import { BookOpen, Brain  } from "lucide-react"
import { NavigateFunction } from "react-router-dom"
import { Card } from "./ui/card"
import { useWordCount } from "../hooks/useWordCount"
import { useTranslation } from "../i18n/useTranslation"
import { OnboardingStep } from "../hooks/useOnboarding"
import { OnboardingTooltip } from "./onboarding/OnboardingTooltip"
import { useAppDispatch, useAppSelector } from "../store/store"
import { generateStory } from "../store/storiesSlice"

interface OnboardingControl {
  currentStep: OnboardingStep
  isActive: boolean
  isCompleted: boolean
  isDismissed: boolean
  completeCurrentStep: () => void
  skipOnboarding: () => void
  resetOnboarding: () => void
  isStepActive: (step: OnboardingStep) => boolean
}

interface ModeSelectionProps {
  onSelectMode: (mode: "read" | "practice") => void
  onboarding: OnboardingControl
  navigate: NavigateFunction
}

export function ModeSelection({ onSelectMode, onboarding, navigate }: ModeSelectionProps) {
  const { wordsCount } = useWordCount()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const readStoriesRef = useRef<HTMLDivElement>(null)

  // Handler for onboarding step 0 (Welcome) - Auto-navigate to story
  const handleOnboardingStart = async () => {
    const userLevel = user?.language_level || 1
    try {
      const result = await dispatch(
        generateStory({ level: userLevel, domain: 'everyday-life' })
      ).unwrap()

      navigate(`/story/${result.id}`)
      onboarding.completeCurrentStep()
    } catch (error) {
      // If story generation fails, just navigate to category selection
      console.error('Failed to generate story for onboarding:', error)
      onSelectMode("read")
    }
  }

  // Check if we're in onboarding steps
  const isWelcomeStep = onboarding.isStepActive(OnboardingStep.WELCOME)
  const isPracticeStep = onboarding.isStepActive(OnboardingStep.PRACTICE_WORDS)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('modeSelection.title')}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Read Stories Button */}
          <Card
            ref={readStoriesRef}
            className="group cursor-pointer border-2 transition-all hover:scale-[1.02] hover:border-primary hover:shadow-lg"
            onClick={() => onSelectMode("read")}
          >
            <div className="flex flex-col items-center gap-6 p-8 text-center">
              <div className="rounded-2xl bg-primary/10 p-6 transition-colors group-hover:bg-primary/20">
                <BookOpen className="h-16 w-16 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('modeSelection.readStories')}</h2>
              </div>
            </div>
          </Card>

          {/* Practice Words Button */}
          <Card
            className="group cursor-pointer border-2 transition-all hover:scale-[1.02] hover:border-primary hover:shadow-lg"
            onClick={() => onSelectMode("practice")}
          >
            <div className="flex flex-col items-center gap-6 p-8 text-center">
              <div className="relative rounded-2xl bg-primary/10 p-6 transition-colors group-hover:bg-primary/20">
                <Brain className="h-16 w-16 text-primary" strokeWidth={1.5} />
                {wordsCount !== undefined && wordsCount > 0 && (
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-500 text-sm font-bold text-white shadow-md">
                    {wordsCount}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('modeSelection.practiceWords')}</h2>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Onboarding Tooltips */}
      {isWelcomeStep && (
        <OnboardingTooltip
          step={OnboardingStep.WELCOME}
          visible={isWelcomeStep}
          onNext={handleOnboardingStart}
          onSkip={onboarding.skipOnboarding}
        />
      )}

      {isPracticeStep && (
        <OnboardingTooltip
          step={OnboardingStep.PRACTICE_WORDS}
          visible={isPracticeStep}
          onNext={() => {
            onboarding.completeCurrentStep()
            onSelectMode("practice")
          }}
          onSkip={onboarding.skipOnboarding}
        />
      )}
    </div>
  )
}
