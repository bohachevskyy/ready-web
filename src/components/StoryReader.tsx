import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { X, ThumbsUp, ThumbsDown } from "lucide-react"
import { VocabularyList } from "./VocabularyList"
import { QuizView } from "./QuizView"
import { StoryLoading } from "./StoryLoading"
import { addWord, removeWord } from "../store/vocabularySlice"
import { setStoryId, setStoryText, setTranslations } from "../store/storySlice"
import { useGenerateStoryMutation, useGetQuestionsMutation, useSubmitFeedbackMutation, type Question } from "../services/storiesApi"
import { useAppDispatch, useAppSelector } from "../store/store"
import type { SavedWord } from "../types"

export function StoryReader() {
  const { domain } = useParams<{ domain: string }>()
  const dispatch = useAppDispatch()
  const savedWords = useAppSelector((state) => state.vocabulary.savedWords)
  const storyId = useAppSelector((state) => state.story.id)
  const storyText = useAppSelector((state) => state.story.text)
  const translations = useAppSelector((state) => state.story.translations)

  // RTK Query hooks
  const [generateStory, { isLoading: isGeneratingStory, error: storyError }] = useGenerateStoryMutation()
  const [getQuestions, { isLoading: isLoadingQuestions }] = useGetQuestionsMutation()
  const [submitFeedback] = useSubmitFeedbackMutation()

  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string } | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)

  // Track if story has been fetched to prevent duplicate requests
  const hasFetchedStory = useRef(false)

  // Questions state
  const [view, setView] = useState<'story' | 'questions' | 'completed'>('story')
  const [questions, setQuestions] = useState<Question[]>([])
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [likeStatus, setLikeStatus] = useState<"like" | "dislike" | null>(null)

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
          level: 1,
          words: ['the'],
          age_bracket: '8-10',
          domain: domain
        }).unwrap()

        dispatch(setStoryId(result.id))
        dispatch(setStoryText(result.story))
        dispatch(setTranslations(result.translations))
      } catch (err) {
        console.error('Failed to fetch story:', err)
        // Fallback to sample text if API fails
        dispatch(setStoryText("Failed to load story. Please try again later."))
      }
    }

    fetchStory()
  }, [generateStory, dispatch, domain])

  const handleFinish = async () => {
    if (!storyId) return

    try {
      const result = await getQuestions(storyId).unwrap()
      setQuestions(result.questions)
      setView('questions')
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    }
  }

  const handleComplete = async () => {
    if (!storyId) return

    setView('completed')
  }

  const handleLikeFeedback = async (status: "like" | "dislike") => {
    if (!storyId) return

    // Toggle status
    const newStatus = likeStatus === status ? null : status
    setLikeStatus(newStatus)

    // Submit feedback if a choice is made
    if (newStatus && !feedbackSubmitted) {
      try {
        await submitFeedback({
          storyId,
          feedback: {
            start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            end_time: new Date().toISOString(),
            is_skipped: false,
            question_attempts: questions.map(q => attemptCounts[q.id] || 0),
            is_liked: newStatus === "like",
            is_disliked: newStatus === "dislike",
            feedback_text: newStatus === "like" ? "Story liked" : "Story disliked"
          }
        }).unwrap()
        setFeedbackSubmitted(true)
      } catch (err) {
        console.error('Failed to submit feedback:', err)
      }
    }
  }

  const handleSkip = async () => {
    if (!storyId) return

    try {
      await submitFeedback({
        storyId,
        feedback: {
          start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          is_skipped: true,
          question_attempts: questions.map(q => attemptCounts[q.id] || 0),
          is_liked: false,
          is_disliked: false,
          feedback_text: "Story skipped"
        }
      }).unwrap()
      setView('completed')
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }

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

  // Show full-screen loading animation while generating story
  if (isGeneratingStory) {
    return <StoryLoading />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div className="flex-1 flex flex-col p-8 overflow-auto">
        <h1 className="text-2xl font-semibold mb-8 text-foreground">
          {view === 'story' ? 'Reading Practice' : view === 'questions' ? 'Quiz Time' : 'Completed!'}
        </h1>
        <div className="max-w-3xl w-full mx-auto">
          <Card className="p-8 bg-card shadow-sm">
            {view === 'story' && (
              <>
                {storyError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-destructive mb-4">Failed to generate story</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                  </div>
                ) : (
                  <>
                    <div className="text-lg leading-relaxed text-card-foreground mb-8">
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
                                    ? "cursor-pointer hover:bg-primary/15 hover:text-primary rounded px-0.5 transition-colors"
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
                    <div className="flex justify-center mt-8">
                      <Button onClick={handleFinish} size="lg" className="px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                        Finish
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {view === 'questions' && (
              <QuizView
                questions={questions}
                isLoading={isLoadingQuestions}
                onComplete={handleComplete}
                onSkip={handleSkip}
                onLikeFeedback={handleLikeFeedback}
                likeStatus={likeStatus}
                feedbackSubmitted={feedbackSubmitted}
              />
            )}

            {view === 'completed' && (
              <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Great job!</h2>
                <p className="text-lg text-muted-foreground mb-8">You have completed the story.</p>
                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleLikeFeedback("like")}
                    className={`gap-2 ${
                      likeStatus === "like"
                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground"
                        : ""
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleLikeFeedback("dislike")}
                    className={`gap-2 ${
                      likeStatus === "dislike"
                        ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        : ""
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    Dislike
                  </Button>
                </div>
                {feedbackSubmitted && (
                  <p className="text-sm text-muted-foreground mb-8">Thank you for your feedback!</p>
                )}
                <Button onClick={() => window.location.reload()} size="lg" className="px-12 bg-primary text-primary-foreground hover:bg-primary/90">
                  Read Another Story
                </Button>
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
          <Card className="bg-popover text-popover-foreground p-3 shadow-lg border-border">
            <div className="flex items-start gap-2 min-w-[150px]">
              <div>
                <p className="font-semibold text-sm">{selectedWord.word}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{selectedWord.translation}</p>
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
