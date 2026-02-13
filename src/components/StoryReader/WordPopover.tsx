import type React from "react"
import { Button } from "../ui/button"
import { X, Plus } from "lucide-react"
import { SpeakerButton } from "../ui/speaker-button"
import type { WordDetailsResponse } from "../../store/storiesSlice"
import type { PopoverPosition } from "./types"
import { useTranslation } from "../../i18n/useTranslation"

interface WordPopoverProps {
  popoverRef: React.RefObject<HTMLDivElement | null>
  popoverPosition: PopoverPosition | null
  selectedWord: WordDetailsResponse | null
  savedWords: Array<{ word: string }>
  onClose: () => void
  onAddWord: () => void
}

export function WordPopover({
  popoverRef,
  popoverPosition,
  selectedWord,
  savedWords,
  onClose,
  onAddWord,
}: WordPopoverProps) {
  const { t } = useTranslation()

  if (!popoverPosition) return null

  const isWordInList = selectedWord
    ? savedWords.some(w => w.word.toLowerCase() === selectedWord.expression.toLowerCase())
    : false

  return (
    <div
      ref={popoverRef}
      className="hidden lg:block fixed z-50 animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: `${popoverPosition.x}px`,
        top: `${popoverPosition.y}px`,
        transform: popoverPosition.showBelow
          ? "translate(-50%, 8px)"
          : "translate(-50%, calc(-100% - 8px))",
      }}
    >
      <div className="bg-popover text-popover-foreground shadow-xl border border-border/50 rounded-xl w-[360px] overflow-hidden">
        {!selectedWord ? (
          // Loading state
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          // Loaded content
          <div className="p-5 space-y-4">
            {/* Header with word and close button */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-xl text-foreground">{selectedWord.expression}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    {selectedWord.grammatical_info}
                  </span>
                </div>
                <SpeakerButton text={selectedWord.expression} size="sm" variant="ghost" />
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1 text-muted-foreground hover:text-foreground" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Translation */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {t('wordPopover.translation')}
              </p>
              <p className="text-base text-foreground">{selectedWord.translation}</p>
            </div>

            {/* Sentence translation */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {t('wordPopover.sentenceTranslation')}
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">{selectedWord.sentence_translation}</p>
            </div>

            {/* Example sentence */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {t('wordPopover.example')}
              </p>
              <p className="text-sm italic text-foreground/80 leading-relaxed">{selectedWord.example_sentence}</p>
            </div>

            {/* Add to list button */}
            <Button
              className="w-full gap-2 rounded-lg"
              onClick={onAddWord}
              disabled={isWordInList}
            >
              <Plus className="h-4 w-4" />
              {isWordInList ? t('wordPopover.alreadyInList') : t('wordPopover.addToVocabulary')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
