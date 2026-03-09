import { Button } from "../ui/button"
import { X, BookOpen } from "lucide-react"
import { VocabularyList } from "../VocabularyList"
import type { SavedWord } from "../../types"
import { useTranslation } from "../../i18n/useTranslation"
import { OnboardingStep } from "../../hooks/useOnboarding"
import { OnboardingTooltip } from "../onboarding/OnboardingTooltip"

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

interface VocabDrawerProps {
  isOpen: boolean
  savedWords: SavedWord[]
  onOpen: () => void
  onClose: () => void
  onRemoveWord: (id: string) => void
  onboarding: OnboardingControl
}

export function VocabDrawer({
  isOpen,
  savedWords,
  onOpen,
  onClose,
  onRemoveWord,
  onboarding,
}: VocabDrawerProps) {
  const { t } = useTranslation()

  const isViewVocabularyStep = onboarding.isStepActive(OnboardingStep.VIEW_VOCABULARY)

  return (
    <>
      {/* Mobile Floating Action Button */}
      <button
        onClick={onOpen}
        className="lg:hidden fixed bottom-20 left-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg z-40 flex items-center gap-2 transition-transform active:scale-95"
        aria-label={t('vocabulary.title')}
      >
        <BookOpen className="h-5 w-5" />
        {savedWords.length > 0 && (
          <span className="bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {savedWords.length}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Bottom Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 max-h-[70vh] overflow-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <div className="sticky top-0 bg-card px-5 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{t('vocabulary.title')}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t('vocabulary.closeDrawer')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <VocabularyList savedWords={savedWords} onRemoveWord={onRemoveWord} onboarding={onboarding} />
        </div>
      )}

      {/* Onboarding tooltip for step 4: View vocabulary (mobile) */}
      {isViewVocabularyStep && savedWords.length > 0 && (
        <OnboardingTooltip
          step={OnboardingStep.VIEW_VOCABULARY}
          visible={isViewVocabularyStep}
          onNext={onboarding.completeCurrentStep}
          onSkip={onboarding.skipOnboarding}
        />
      )}
    </>
  )
}
