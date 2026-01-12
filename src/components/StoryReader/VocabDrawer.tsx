import { Button } from "../ui/button"
import { X, BookOpen } from "lucide-react"
import { VocabularyList } from "../VocabularyList"
import type { SavedWord } from "../../types"

interface VocabDrawerProps {
  isOpen: boolean
  savedWords: SavedWord[]
  onOpen: () => void
  onClose: () => void
  onRemoveWord: (id: string) => void
}

export function VocabDrawer({
  isOpen,
  savedWords,
  onOpen,
  onClose,
  onRemoveWord,
}: VocabDrawerProps) {
  return (
    <>
      {/* Mobile Floating Action Button */}
      <button
        onClick={onOpen}
        className="lg:hidden fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg z-40 flex items-center gap-2"
        aria-label="Open vocabulary list"
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
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Bottom Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 max-h-[70vh] overflow-auto animate-in slide-in-from-bottom duration-300">
          <div className="sticky top-0 bg-card p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Vocabulary List</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close vocabulary list"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <VocabularyList savedWords={savedWords} onRemoveWord={onRemoveWord} />
        </div>
      )}
    </>
  )
}
