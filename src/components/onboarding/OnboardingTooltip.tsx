import { useEffect, useState } from "react"
import { X, Sparkles } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"
import { OnboardingStep } from "../../hooks/useOnboarding"

interface OnboardingTooltipProps {
  step: OnboardingStep
  visible: boolean
  onNext: () => void
  onSkip: () => void
}

const STEP_TO_I18N_KEY: Record<OnboardingStep, string> = {
  [OnboardingStep.WELCOME]: "step0",
  [OnboardingStep.AUTO_NAVIGATE]: "step1",
  [OnboardingStep.CLICK_WORD]: "step2",
  [OnboardingStep.ADD_WORD]: "step3",
  [OnboardingStep.VIEW_VOCABULARY]: "step4",
  [OnboardingStep.PRACTICE_WORDS]: "step5",
  [OnboardingStep.COMPLETED]: "completed",
}

const VISIBLE_STEPS = [
  OnboardingStep.WELCOME,
  OnboardingStep.CLICK_WORD,
  OnboardingStep.ADD_WORD,
  OnboardingStep.VIEW_VOCABULARY,
  OnboardingStep.PRACTICE_WORDS,
]

export function OnboardingTooltip({
  step,
  visible,
  onNext,
  onSkip,
}: OnboardingTooltipProps) {
  const { t } = useTranslation()
  const [show, setShow] = useState(visible)

  useEffect(() => {
    setShow(visible)
  }, [visible])

  // Auto-dismiss after 60 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onSkip()
      }, 60000)
      return () => clearTimeout(timer)
    }
  }, [show, onSkip])

  if (!show || !visible) return null

  // Get the i18n key for the current step
  const stepKey = STEP_TO_I18N_KEY[step] || "step0"

  // Calculate step number for progress indicator (only count visible steps)
  const visibleStepIndex = VISIBLE_STEPS.indexOf(step)
  const stepNumber = visibleStepIndex >= 0 ? visibleStepIndex + 1 : 1
  const totalSteps = VISIBLE_STEPS.length

  // Get translated content
  const title = t(`onboarding.${stepKey}.title`)
  const message = t(`onboarding.${stepKey}.message`)
  const skipText = t("onboarding.skip")
  const nextText = t("onboarding.next")
  const progress = t("onboarding.progress", {
    current: stepNumber.toString(),
    total: totalSteps.toString(),
  })

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md w-[calc(100%-2rem)]">
      <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-2xl border-2 border-primary-foreground/20">
        {/* Header with icon and close button */}
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="h-5 w-5 mt-0.5 flex-shrink-0 opacity-90" />
          <div className="flex-1">
            <h3 className="text-base font-semibold leading-snug">{title}</h3>
          </div>
          <button
            onClick={onSkip}
            className="flex-shrink-0 p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm font-medium leading-relaxed opacity-95 mb-4 ml-8">
          {message}
        </p>

        {/* Footer with progress and actions */}
        <div className="flex items-center justify-between gap-4 ml-8">
          <span className="text-xs opacity-75 font-medium">{progress}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-primary-foreground/20 transition-colors"
            >
              {skipText}
            </button>
            <button
              onClick={onNext}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-foreground/90 text-primary hover:bg-primary-foreground transition-colors shadow-sm"
            >
              {nextText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
