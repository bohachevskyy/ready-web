import { useRef } from "react"
import { BookOpen, Brain, Search, GraduationCap } from "lucide-react"
import { NavigateFunction } from "react-router-dom"
import { useWordCount } from "../hooks/useWordCount"
import { useDashboard } from "../hooks/useDashboard"
import { useTranslation } from "../i18n/useTranslation"
import { OnboardingStep } from "../hooks/useOnboarding"
import { OnboardingTooltip } from "./onboarding/OnboardingTooltip"
import { useAppDispatch, useAppSelector } from "../store/store"
import { generateStory } from "../store/storiesSlice"
import { Dashboard } from "./Dashboard/Dashboard"
import { DuoCard } from "./ui/duo-card"
import { cn } from "../lib/utils"

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
  const { stats, isLoading } = useDashboard()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const readStoriesRef = useRef<HTMLDivElement>(null)

  const handleOnboardingStart = async () => {
    const userLevel = user?.language_level || 1
    try {
      const result = await dispatch(
        generateStory({ level: userLevel, domain: "everyday-life" }),
      ).unwrap()

      navigate(`/story/${result.id}`)
      onboarding.completeCurrentStep()
    } catch (error) {
      console.error("Failed to generate story for onboarding:", error)
      onSelectMode("read")
    }
  }

  const isWelcomeStep = onboarding.isStepActive(OnboardingStep.WELCOME)
  const isPracticeStep = onboarding.isStepActive(OnboardingStep.PRACTICE_WORDS)

  const fmt = (n: number | undefined) => (n === undefined ? "—" : String(n))

  return (
    <div className="bg-cream py-10 px-8 pb-20 min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1200px] anim-slide">
        <h1 className="font-black text-[40px] m-0 mb-7 leading-[1] tracking-tight">
          {t("modeSelection.title")}
        </h1>

        {/* Two giant mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <BigModeCard
            ref={readStoriesRef}
            title={t("modeSelection.readStories")}
            icon="book"
            onClick={() => onSelectMode("read")}
          />
          <BigModeCard
            title={t("modeSelection.practiceWords")}
            icon="brain"
            badge={wordsCount && wordsCount > 0 ? wordsCount : undefined}
            onClick={() => onSelectMode("practice")}
          />
        </div>

        {/* Your Progress */}
        <h2 className="font-black text-[28px] mt-10 mb-4 leading-tight">
          {t("dashboard.title") || "Your Progress"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <ProgressStat
            icon="book"
            value={isLoading ? "…" : fmt(stats?.stories_read)}
            label={t("dashboard.storiesRead")}
          />
          <ProgressStat
            icon="search"
            value={isLoading ? "…" : fmt(stats?.words_found)}
            label={t("dashboard.wordsFound")}
          />
          <ProgressStat
            icon="cap"
            value={isLoading ? "…" : fmt(stats?.words_practiced)}
            label={t("dashboard.wordsPracticed")}
          />
        </div>

        <Dashboard />
      </div>

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

const BigModeCard = ({
  title,
  icon,
  badge,
  onClick,
  ref,
}: {
  title: string
  icon: "book" | "brain"
  badge?: number
  onClick: () => void
  ref?: React.Ref<HTMLDivElement>
}) => {
  const Icon = icon === "book" ? BookOpen : Brain
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "bg-paper border-2 border-line rounded-[22px] py-[52px] px-8 text-center cursor-pointer relative",
        "transition-[transform,box-shadow] duration-100",
        "shadow-[0_1px_0_rgba(0,0,0,.04),0_4px_0_hsl(var(--line))]",
        "hover:shadow-[0_1px_0_rgba(0,0,0,.04),0_6px_0_hsl(var(--line))] hover:-translate-y-[1px]",
        "active:translate-y-[3px] active:shadow-[0_1px_0_hsl(var(--line-2))]",
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="w-24 h-24 rounded-[20px] bg-green-soft text-green mx-auto mb-5 grid place-items-center relative">
        <Icon className="h-14 w-14" strokeWidth={2} />
        {badge != null && (
          <div className="absolute -top-1.5 -right-1.5 min-w-[28px] h-7 px-2 rounded-full bg-heart text-white font-black text-[13px] grid place-items-center border-2 border-paper">
            {badge}
          </div>
        )}
      </div>
      <div className="text-[24px] font-black text-ink">{title}</div>
    </div>
  )
}

function ProgressStat({
  icon,
  value,
  label,
}: {
  icon: "book" | "search" | "cap"
  value: string
  label: string
}) {
  const Icon = icon === "book" ? BookOpen : icon === "search" ? Search : GraduationCap
  return (
    <DuoCard className="p-7 text-center">
      <div className="w-16 h-16 rounded-2xl bg-green-soft text-green mx-auto mb-4 grid place-items-center">
        <Icon className="h-8 w-8" strokeWidth={2} />
      </div>
      <div className="text-[36px] font-black leading-[1]">{value}</div>
      <div className="text-ink-mute text-sm font-bold mt-2">{label}</div>
    </DuoCard>
  )
}
