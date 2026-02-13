import { Button } from "../ui/button"
import { X, Plus, Loader2 } from "lucide-react"
import { SpeakerButton } from "../ui/speaker-button"
import type { WordDetailsResponse } from "../../store/storiesSlice"
import { useTranslation } from "../../i18n/useTranslation"

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
  const { t } = useTranslation()

  if (!isOpen) return null

  const isWordInList = selectedWord
    ? savedWords.some(w => w.word.toLowerCase() === selectedWord.expression.toLowerCase())
    : false

  return (
    <>
      {/* Overlay */}
      <div
        className="lg:hidden fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 max-h-[70vh] overflow-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Sticky Header */}
        <div className="sticky top-0 bg-card px-5 py-3 flex items-center justify-between">
          {selectedWord ? (
            <div className="flex items-center gap-2 flex-1">
              <h3 className="font-semibold text-xl text-foreground">{selectedWord.expression}</h3>
              <SpeakerButton
                text={selectedWord.expression}
                size="sm"
                variant="ghost"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground text-sm">{t('wordPopover.loading')}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close word details"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {selectedWord && (
          <div className="px-5 pb-6 pt-2 space-y-4">
            {/* Grammatical info badge */}
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {selectedWord.grammatical_info}
            </span>

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
              <p className="text-sm text-foreground/80 leading-relaxed">
                {selectedWord.sentence_translation}
              </p>
            </div>

            {/* Example sentence */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {t('wordPopover.example')}
              </p>
              <p className="text-sm italic text-foreground/80 leading-relaxed">
                {selectedWord.example_sentence}
              </p>
            </div>

            {/* Add to vocabulary button */}
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
    </>
  )
}
