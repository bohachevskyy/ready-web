import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { X, Loader2 } from "lucide-react"
import { VocabularyList } from "./VocabularyList"
import { addWord, removeWord } from "../store/vocabularySlice"
import { setStoryText, setTranslations } from "../store/storySlice"
import { useGenerateStoryMutation } from "../services/storiesApi"
import { useAppDispatch, useAppSelector } from "../store/store"
import type { SavedWord } from "../types"

export function StoryReader() {
  const dispatch = useAppDispatch()
  const savedWords = useAppSelector((state) => state.vocabulary.savedWords)
  const storyText = useAppSelector((state) => state.story.text)
  const translations = useAppSelector((state) => state.story.translations)

  // RTK Query hooks
  const [generateStory, { isLoading: isGeneratingStory, error: storyError }] = useGenerateStoryMutation()

  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string } | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)

  // Track if story has been fetched to prevent duplicate requests
  const hasFetchedStory = useRef(false)

  // Helper function to clean word and get translation
  const getTranslation = (word: string): string | null => {
    const cleanWord = word.trim().replace(/[.,!?;:"""''()[\]{}]/g, '')
    return translations[cleanWord] || null
  }

  // Fetch story on component mount
  useEffect(() => {
    if (hasFetchedStory.current) return

    const fetchStory = async () => {
      hasFetchedStory.current = true
      try {
        const result = await generateStory({
          level: 2,
          words: ['the'],
          age_bracket: '18+'
        }).unwrap()

        dispatch(setStoryText(result.story))
        dispatch(setTranslations(result.translations))
      } catch (err) {
        console.error('Failed to fetch story:', err)
        // Fallback to sample text if API fails
        dispatch(setStoryText("Failed to load story. Please try again later."))
      }
    }

    fetchStory()
  }, [generateStory, dispatch])

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    const translation = getTranslation(word)
    if (!translation) return

    const cleanWord = word.trim().replace(/[.,!?;:"""''()[\]{}]/g, '')

    // Position popover near the clicked word
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })

    // Show translation from store
    setSelectedWord({
      word: cleanWord,
      translation: translation,
    })

    // Add to Redux vocabulary store
    const newWord: SavedWord = {
      id: `${Date.now()}-${cleanWord}`,
      word: cleanWord,
      translation: translation,
      timestamp: Date.now(),
    }
    dispatch(addWord(newWord))
  }

  const handleRemoveWord = (id: string) => {
    dispatch(removeWord(id))
  }

  const lines = storyText.split('\n')

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="max-w-3xl w-full">
          <h1 className="text-2xl font-semibold mb-8 text-foreground">Reading Practice</h1>
          <Card className="p-8 bg-card shadow-sm">
            {isGeneratingStory ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Generating your story...</p>
              </div>
            ) : storyError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-destructive mb-4">Failed to generate story</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : (
              <div className="text-lg leading-relaxed text-card-foreground">
                {lines.map((line, lineIndex) => {
                  const tokens = line.split(/(\s+|[.,!?;:"""''()[\]{}]+)/)
                  return (
                    <p key={lineIndex}>
                      {tokens.map((token, tokenIndex) => {
                        // Skip empty tokens
                        if (!token) return null

                        // Render whitespace as-is
                        if (token.match(/^\s+$/)) {
                          return <span key={tokenIndex}>{token}</span>
                        }

                        // Render punctuation as plain text
                        if (token.match(/^[.,!?;:"""''()[\]{}]+$/)) {
                          return <span key={tokenIndex}>{token}</span>
                        }

                        // Check if word has translation
                        const hasTranslation = getTranslation(token) !== null

                        return (
                          <span
                            key={tokenIndex}
                            onClick={hasTranslation ? (e) => handleWordClick(token, e) : undefined}
                            className={hasTranslation
                              ? "cursor-pointer hover:bg-yellow-200 rounded px-0.5 transition-colors"
                              : ""
                            }
                          >
                            {token}
                          </span>
                        )
                      })}
                    </p>
                  )
                })}
              </div>
            )}
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
              <div className="flex-1">
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
      <VocabularyList savedWords={savedWords} onRemoveWord={handleRemoveWord} />
    </div>
  )
}
