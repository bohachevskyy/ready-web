import type React from "react"
import { X, Plus } from "lucide-react"
import { SpeakerButton } from "../ui/speaker-button"
import type { WordDetailsResponse } from "../../store/storiesSlice"
import type { PopoverPosition } from "./types"
import { useTranslation } from "../../i18n/useTranslation"
import { OnboardingStep } from "../../hooks/useOnboarding"
import { OnboardingTooltip } from "../onboarding/OnboardingTooltip"
import { DuoButton } from "../ui/duo-button"

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

interface WordPopoverProps {
  popoverRef: React.RefObject<HTMLDivElement | null>
  popoverPosition: PopoverPosition | null
  selectedWord: WordDetailsResponse | null
  savedWords: Array<{ word: string }>
  onClose: () => void
  onAddWord: () => void
  onboarding: OnboardingControl
}

export function WordPopover({
  popoverRef,
  popoverPosition,
  selectedWord,
  savedWords,
  onClose,
  onAddWord,
  onboarding,
}: WordPopoverProps) {
  const { t } = useTranslation()

  if (!popoverPosition) return null

  const isWordInList = selectedWord
    ? savedWords.some((w) => w.word.toLowerCase() === selectedWord.expression.toLowerCase())
    : false

  const isAddWordStep = onboarding.isStepActive(OnboardingStep.ADD_WORD)

  const handleAddWord = () => {
    onAddWord()
    if (isAddWordStep) onboarding.completeCurrentStep()
  }

  return (
    <div
      ref={popoverRef}
      className="hidden lg:block fixed z-50 anim-bounce"
      style={{
        left: `${popoverPosition.x}px`,
        top: `${popoverPosition.y}px`,
        transform: popoverPosition.showBelow
          ? "translate(-50%, 8px)"
          : "translate(-50%, calc(-100% - 8px))",
      }}
    >
      <div
        className="bg-paper rounded-[16px] border-2 border-line-2 w-[360px] overflow-hidden"
        style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,.18)' }}
      >
        {!selectedWord ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green border-t-transparent" />
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Header with word and close button */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-serif font-bold text-[22px] text-ink leading-tight">
                    {selectedWord.expression}
                  </h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-cream-2 text-ink-soft text-xs font-bold italic">
                    {selectedWord.grammatical_info}
                  </span>
                </div>
                <SpeakerButton text={selectedWord.expression} size="sm" variant="ghost" />
              </div>
              <button
                onClick={onClose}
                className="h-7 w-7 -mt-1 -mr-1 rounded-full bg-transparent border-0 grid place-items-center text-ink-mute hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Translation */}
            <div>
              <p className="text-[11px] font-black text-ink-mute uppercase tracking-wider mb-1">
                {t('wordPopover.translation')}
              </p>
              <p className="text-[15px] font-semibold text-ink">{selectedWord.translation}</p>
            </div>

            {/* Sentence translation */}
            {selectedWord.sentence_translation && (
              <div>
                <p className="text-[11px] font-black text-ink-mute uppercase tracking-wider mb-1">
                  {t('wordPopover.sentenceTranslation')}
                </p>
                <p className="text-sm text-ink-soft leading-relaxed">{selectedWord.sentence_translation}</p>
              </div>
            )}

            {/* Example sentence */}
            {selectedWord.example_sentence && (
              <div>
                <p className="text-[11px] font-black text-ink-mute uppercase tracking-wider mb-1">
                  {t('wordPopover.example')}
                </p>
                <p
                  className="text-sm italic text-ink-soft leading-relaxed bg-cream-2 px-3 py-2 rounded-[10px] border-l-[3px] border-gold"
                  style={{ fontFamily: 'var(--serif), Georgia, serif' }}
                >
                  {selectedWord.example_sentence}
                </p>
              </div>
            )}

            {/* Add to list button */}
            <DuoButton
              size="sm"
              block
              onClick={handleAddWord}
              disabled={isWordInList}
              variant={isWordInList ? 'secondary' : 'primary'}
            >
              <Plus className="h-4 w-4" />
              {isWordInList ? t('wordPopover.alreadyInList') : t('wordPopover.addToVocabulary')}
            </DuoButton>
          </div>
        )}
      </div>

      {isAddWordStep && selectedWord && (
        <OnboardingTooltip
          step={OnboardingStep.ADD_WORD}
          visible={isAddWordStep}
          onNext={onboarding.completeCurrentStep}
          onSkip={onboarding.skipOnboarding}
        />
      )}
    </div>
  )
}
