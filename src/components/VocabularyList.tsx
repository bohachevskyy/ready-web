import { Button } from "./ui/button"
import { X, BookOpen } from "lucide-react"
import { useTranslation } from "../i18n/useTranslation"
import { OnboardingStep } from "../hooks/useOnboarding"
import { OnboardingTooltip } from "./onboarding/OnboardingTooltip"

interface SavedWord {
  id: string
  word: string
  translation: string
  timestamp: number
}

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

interface VocabularyListProps {
  savedWords: SavedWord[]
  onRemoveWord: (id: string) => void
  onboarding: OnboardingControl
}

export function VocabularyList({ savedWords, onRemoveWord, onboarding }: VocabularyListProps) {
  const { t } = useTranslation()

  const isViewVocabularyStep = onboarding.isStepActive(OnboardingStep.VIEW_VOCABULARY)

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-foreground">
            {t('vocabulary.title')}
          </h2>
          {savedWords.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
              {savedWords.length}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('vocabulary.hint')}
        </p>
      </div>

      <div className="flex-1 px-5 pb-5">
        {savedWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-4">
              <BookOpen className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              {t('vocabulary.emptyState')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedWords.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-3 p-3 rounded-lg bg-card hover:bg-muted/40 transition-colors duration-150 animate-in fade-in slide-in-from-right-2 duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground leading-snug">{item.word}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.translation}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveWord(item.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onboarding tooltip for step 4: View vocabulary */}
      {isViewVocabularyStep && savedWords.length > 0 && (
        <OnboardingTooltip
          step={OnboardingStep.VIEW_VOCABULARY}
          visible={isViewVocabularyStep}
          onNext={onboarding.completeCurrentStep}
          onSkip={onboarding.skipOnboarding}
        />
      )}
    </div>
  )
}
