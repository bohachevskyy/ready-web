import { Button } from "../ui/button"
import { X, Plus, Loader2 } from "lucide-react"
import { SpeakerButton } from "../ui/speaker-button"
import type { WordDetailsResponse } from "../../store/storiesSlice"

interface WordDrawerProps {
  isOpen: boolean
  selectedWord: WordDetailsResponse | null
  savedWords: Array<{ word: string }>
  onClose: () => void
  onAddWord: () => void
}

export function WordDrawer({
  isOpen,
  selectedWord,
  savedWords,
  onClose,
  onAddWord,
}: WordDrawerProps) {
  if (!isOpen) return null

  const isWordInList = selectedWord
    ? savedWords.some(w => w.word.toLowerCase() === selectedWord.expression.toLowerCase())
    : false

  return (
    <>
      {/* Overlay */}
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 max-h-[70vh] overflow-auto animate-in slide-in-from-bottom duration-300">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-card p-4 border-b border-border flex items-center justify-between">
          {selectedWord ? (
            <div className="flex items-center gap-2 flex-1">
              <h3 className="font-semibold text-lg">{selectedWord.expression}</h3>
              <SpeakerButton
                text={selectedWord.expression}
                size="sm"
                variant="ghost"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close word details"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {selectedWord && (
          <div className="p-6 space-y-4">
            {/* Grammatical info */}
            <p className="text-muted-foreground text-sm italic">
              {selectedWord.grammatical_info}
            </p>

            {/* Translation */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Translation
              </p>
              <p className="text-base">{selectedWord.translation}</p>
            </div>

            {/* Sentence translation */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Sentence translation
              </p>
              <p className="text-sm text-card-foreground">
                {selectedWord.sentence_translation}
              </p>
            </div>

            {/* Example sentence */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Example
              </p>
              <p className="text-sm italic text-card-foreground">
                {selectedWord.example_sentence}
              </p>
            </div>

            {/* Add to vocabulary button */}
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
      </div>
    </>
  )
}
