import type React from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { X, Plus } from "lucide-react"
import { SpeakerButton } from "../ui/speaker-button"
import type { WordDetailsResponse } from "../../store/storiesSlice"
import type { PopoverPosition } from "./types"

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
          ? "translate(-50%, 0)"
          : "translate(-50%, -100%)",
      }}
    >
      <Card className="bg-popover text-popover-foreground shadow-lg border-border w-[400px]">
        {!selectedWord ? (
          // Loading state
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          // Loaded content
          <div className="p-4 space-y-4">
            {/* Header with word and close button */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-lg">{selectedWord.expression}</h3>
                  <p className="text-muted-foreground text-sm italic">{selectedWord.grammatical_info}</p>
                </div>
                <SpeakerButton text={selectedWord.expression} size="sm" variant="ghost" />
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Translation */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Translation</p>
              <p className="text-base">{selectedWord.translation}</p>
            </div>

            {/* Sentence translation */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Sentence translation</p>
              <p className="text-sm text-card-foreground">{selectedWord.sentence_translation}</p>
            </div>

            {/* Example sentence */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Example</p>
              <p className="text-sm italic text-card-foreground">{selectedWord.example_sentence}</p>
            </div>

            {/* Add to list button */}
            <Button
              className="w-full gap-2"
              onClick={onAddWord}
              disabled={isWordInList}
            >
              <Plus className="h-4 w-4" />
              {isWordInList ? "Already in list" : "Add to vocabulary list"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
