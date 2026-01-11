import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { X } from "lucide-react"

interface SavedWord {
  id: string
  word: string
  translation: string
  timestamp: number
}

interface VocabularyListProps {
  savedWords: SavedWord[]
  onRemoveWord: (id: string) => void
}

export function VocabularyList({ savedWords, onRemoveWord }: VocabularyListProps) {
  return (
    <div className="bg-sidebar overflow-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-sidebar-foreground">Vocabulary List</h2>
        <p className="text-sm text-muted-foreground mb-6">Click on words in the text to add them here</p>

        <div className="space-y-3">
          {savedWords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No words saved yet</p>
          ) : (
            savedWords.map((item) => (
              <Card key={item.id} className="p-3 bg-sidebar-accent shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-sidebar-accent-foreground">{item.word}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.translation}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => onRemoveWord(item.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
