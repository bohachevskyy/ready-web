import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { X, Loader2, ThumbsUp, ThumbsDown } from "lucide-react"
import { VocabularyList } from "./VocabularyList"
import { addWord, removeWord } from "../store/vocabularySlice"
import { setStoryId, setStoryText, setTranslations } from "../store/storySlice"
import { useGenerateStoryMutation, useGetQuestionsMutation, useSubmitFeedbackMutation, type Question } from "../services/storiesApi"
import { useAppDispatch, useAppSelector } from "../store/store"
import type { SavedWord } from "../types"

export function StoryReader() {
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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  const [incorrectAnswers, setIncorrectAnswers] = useState<Record<string, boolean>>({})
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({})
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

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
          age_bracket: '8-10'
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
  }, [generateStory, dispatch])

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

  const handleAnswerSelect = (questionId: string, answerIndex: number, correctAnswer: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }))

    // Increment attempt count
    setAttemptCounts(prev => ({ ...prev, [questionId]: (prev[questionId] || 0) + 1 }))

    if (answerIndex === correctAnswer) {
      // Correct answer
      setCorrectAnswers(prev => ({ ...prev, [questionId]: true }))
      setIncorrectAnswers(prev => ({ ...prev, [questionId]: false }))
    } else {
      // Incorrect answer
      setIncorrectAnswers(prev => ({ ...prev, [questionId]: true }))
      setCorrectAnswers(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const allQuestionsCorrect = questions.every(q => correctAnswers[q.id])

  const handleComplete = async () => {
    if (!storyId || !allQuestionsCorrect) return

    setView('completed')
  }

  const handleLikeFeedback = async (isLiked: boolean) => {
    if (!storyId || feedbackSubmitted) return

    try {
      await submitFeedback({
        storyId,
        feedback: {
          start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          is_skipped: false,
          question_attempts: questions.map(q => attemptCounts[q.id] || 0),
          is_liked: isLiked,
          is_disliked: !isLiked,
          feedback_text: isLiked ? "Story liked" : "Story disliked"
        }
      }).unwrap()
      setFeedbackSubmitted(true)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
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

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div className="flex-1 flex flex-col p-8">
        <div className="max-w-3xl w-full mx-auto flex flex-col h-full">
          <h1 className="text-2xl font-semibold mb-8 text-foreground flex-shrink-0">
            {view === 'story' ? 'Reading Practice' : view === 'questions' ? 'Questions' : 'Completed!'}
          </h1>
          <Card className="p-8 bg-card shadow-sm flex-1 overflow-auto">
            {view === 'story' && (
              <>
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
                    <div className="flex justify-center mt-8">
                      <Button onClick={handleFinish} className="h-11 px-8">
                        Finish
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {view === 'questions' && (
              <>
                {isLoadingQuestions ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Loading questions...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {questions.map((question, qIndex) => (
                      <div key={question.id} className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">
                          {qIndex + 1}. {question.text}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {question.options.map((option, optIndex) => {
                            const isSelected = selectedAnswers[question.id] === optIndex
                            const isCorrect = correctAnswers[question.id] && isSelected
                            const isIncorrect = incorrectAnswers[question.id] && isSelected

                            return (
                              <Button
                                key={optIndex}
                                variant={isCorrect ? "default" : isIncorrect ? "destructive" : "outline"}
                                className={`h-auto py-3 px-4 text-left justify-start ${
                                  isCorrect ? "bg-green-500 hover:bg-green-600" :
                                  isIncorrect ? "bg-red-500 hover:bg-red-600" : ""
                                }`}
                                onClick={() => handleAnswerSelect(question.id, optIndex, question.correct_answer)}
                              >
                                {option}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-col items-center gap-3 mt-12 pt-8 border-t">
                      <Button
                        onClick={handleComplete}
                        disabled={!allQuestionsCorrect}
                        size="lg"
                        className="w-64 bg-primary hover:bg-primary/90"
                      >
                        Complete
                      </Button>
                      <Button
                        onClick={handleSkip}
                        variant="ghost"
                        size="lg"
                        className="w-64 text-muted-foreground"
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === 'completed' && (
              <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Great job!</h2>
                <p className="text-lg text-muted-foreground mb-8">You have completed the story.</p>
                {!feedbackSubmitted && (
                  <div className="flex gap-4 mb-8">
                    <Button
                      onClick={() => handleLikeFeedback(true)}
                      size="lg"
                      variant="outline"
                      className="w-32 gap-2"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      Like
                    </Button>
                    <Button
                      onClick={() => handleLikeFeedback(false)}
                      size="lg"
                      variant="outline"
                      className="w-32 gap-2"
                    >
                      <ThumbsDown className="h-5 w-5" />
                      Dislike
                    </Button>
                  </div>
                )}
                {feedbackSubmitted && (
                  <p className="text-sm text-muted-foreground mb-8">Thank you for your feedback!</p>
                )}
                <Button onClick={() => window.location.reload()} size="lg">
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
