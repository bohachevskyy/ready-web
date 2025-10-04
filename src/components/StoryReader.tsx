import type React from "react"

import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { VocabularyList } from "./VocabularyList"

interface SavedWord {
  id: string
  word: string
  translation: string
  timestamp: number
}

const sampleText = `In the heart of the ancient forest, where sunlight filtered through the dense canopy, a small village thrived in harmony with nature. The villagers were known for their exceptional craftsmanship and their deep respect for the environment. Every morning, they would gather in the central square to share stories and plan their daily activities. The elders taught the young ones about the importance of preserving their traditions while embracing new knowledge. Life moved at a gentle pace, allowing everyone to appreciate the beauty that surrounded them.`

// Mock translation function - in a real app, this would call a translation API
const getTranslation = (word: string): string => {
  const translations: Record<string, string> = {
    heart: "corazón",
    ancient: "antiguo",
    forest: "bosque",
    sunlight: "luz del sol",
    filtered: "filtrado",
    dense: "denso",
    canopy: "dosel",
    village: "pueblo",
    thrived: "prosperó",
    harmony: "armonía",
    nature: "naturaleza",
    villagers: "aldeanos",
    exceptional: "excepcional",
    craftsmanship: "artesanía",
    respect: "respeto",
    environment: "medio ambiente",
    morning: "mañana",
    gather: "reunirse",
    central: "central",
    square: "plaza",
    stories: "historias",
    daily: "diario",
    activities: "actividades",
    elders: "ancianos",
    taught: "enseñaron",
    importance: "importancia",
    preserving: "preservar",
    traditions: "tradiciones",
    embracing: "abrazar",
    knowledge: "conocimiento",
    gentle: "suave",
    pace: "ritmo",
    appreciate: "apreciar",
    beauty: "belleza",
    surrounded: "rodeado",
  }

  const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "")
  return translations[cleanWord] || `traducción de "${word}"`
}

export function StoryReader() {
  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string } | null>(null)
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    const cleanWord = word.trim()
    if (!cleanWord) return

    const translation = getTranslation(cleanWord)
    setSelectedWord({ word: cleanWord, translation })

    // Position popover near the clicked word
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })

    // Add to saved words if not already there
    if (!savedWords.find((w) => w.word.toLowerCase() === cleanWord.toLowerCase())) {
      const newWord: SavedWord = {
        id: `${Date.now()}-${cleanWord}`,
        word: cleanWord,
        translation,
        timestamp: Date.now(),
      }
      setSavedWords((prev) => [newWord, ...prev])
    }
  }

  const removeWord = (id: string) => {
    setSavedWords((prev) => prev.filter((w) => w.id !== id))
  }

  const words = sampleText.split(/(\s+)/)

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="max-w-3xl w-full">
          <h1 className="text-2xl font-semibold mb-8 text-foreground">Reading Practice</h1>
          <Card className="p-8 bg-card shadow-sm">
            <p className="text-lg leading-relaxed text-card-foreground">
              {words.map((word, index) => {
                if (word.match(/^\s+$/)) {
                  return <span key={index}>{word}</span>
                }
                return (
                  <span
                    key={index}
                    onClick={(e) => handleWordClick(word, e)}
                    className="cursor-pointer hover:bg-primary/15 hover:text-primary rounded px-0.5 transition-colors"
                  >
                    {word}
                  </span>
                )
              })}
            </p>
          </Card>
        </div>
      </div>

      {/* Translation popover */}
      {selectedWord && popoverPosition && (
        <div
          className="fixed z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <Card className="bg-gray-100 text-gray-900 p-3 shadow-lg border border-gray-300">
            <div className="flex items-start gap-2 min-w-[150px]">
              <div>
                <p className="font-semibold text-sm">{selectedWord.word}</p>
                <p className="text-sm text-gray-600 mt-0.5">{selectedWord.translation}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1" onClick={() => setSelectedWord(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Vocabulary list sidebar */}
      <VocabularyList savedWords={savedWords} onRemoveWord={removeWord} />
    </div>
  )
}
