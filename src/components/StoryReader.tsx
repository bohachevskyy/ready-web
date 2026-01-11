import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { X, Plus, Loader2, BookOpen } from "lucide-react"
import { VocabularyList } from "./VocabularyList"
import { QuizView } from "./QuizView"
import { StoryLoading } from "./StoryLoading"
import { SpeakerButton } from "./ui/speaker-button"
import { addWord, removeWord, clearAllWords } from "../store/vocabularySlice"
import { setStoryId, setStoryText, setTranslations } from "../store/storySlice"
import { generateStory, getQuestions, submitFeedback, getWordDetails, saveWords, type Question, type WordDetailsResponse } from "../store/storiesSlice"
import { useAppDispatch, useAppSelector } from "../store/store"
import type { SavedWord } from "../types"
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis"

export function StoryReader() {
  const { domain } = useParams<{ domain: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const savedWords = useAppSelector((state) => state.vocabulary.savedWords)
  const storyId = useAppSelector((state) => state.story.id)
  const storyText = useAppSelector((state) => state.story.text)

  // Redux Thunk selectors
  const isGeneratingStory = useAppSelector((state) => state.stories.isGeneratingStory)
  const isLoadingQuestions = useAppSelector((state) => state.stories.isLoadingQuestions)
  const storyError = useAppSelector((state) => state.stories.error)

  // Speech synthesis for word pronunciation
  const { speak, supported: speechSupported } = useSpeechSynthesis()
  const { autoPlayEnabled, speechRate } = useAppSelector((state) => state.speechSettings)

  const [selectedWord, setSelectedWord] = useState<WordDetailsResponse | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number; showBelow: boolean; horizontalAlign: 'left' | 'center' | 'right' } | null>(null)

  // Track if story has been fetched to prevent duplicate requests
  const hasFetchedStory = useRef(false)
  
  // Ref for the popover element to detect outside clicks
  const popoverRef = useRef<HTMLDivElement>(null)

  // Questions state
  const [view, setView] = useState<'story' | 'questions'>('story')
  const [questions, setQuestions] = useState<Question[]>([])
  const [attemptCounts] = useState<Record<string, number>>({})
  const [feedbackSubmitted] = useState(false)
  const [likeStatus, setLikeStatus] = useState<"like" | "dislike" | null>(null)
  const [isVocabDrawerOpen, setIsVocabDrawerOpen] = useState<boolean>(false)

  // Fetch story on component mount
  useEffect(() => {
    if (hasFetchedStory.current) return

    const fetchStory = async () => {
      hasFetchedStory.current = true
      try {
        const result = await dispatch(generateStory({
          level: 1,
          age_bracket: '8-10',
          domain: domain
        })).unwrap()

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
  }, [dispatch, domain])

  // Auto-play pronunciation when word popup is shown
  useEffect(() => {
    if (autoPlayEnabled && speechSupported && selectedWord) {
      // Small delay to prevent immediate play and give smooth transition
      const timer = setTimeout(() => {
        speak(selectedWord.expression, { rate: speechRate })
      }, 300)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [selectedWord, autoPlayEnabled, speechSupported, speak, speechRate])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        // Check if the click is on a word (which should open a new popover, not close the current one)
        const target = event.target as HTMLElement
        const isWordClick = target.closest('[data-start][data-end]') !== null
        
        // Only close if it's not a word click
        if (!isWordClick) {
          setSelectedWord(null)
          setPopoverPosition(null)
        }
      }
    }

    if (popoverPosition) {
      // Add event listener with a small delay to prevent immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [popoverPosition])

  const handleFinish = async () => {
    if (!storyId) return

    try {
      const result = await dispatch(getQuestions(storyId)).unwrap()
      setQuestions(result.questions)
      setView('questions')
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    }
  }

  const handleComplete = async () => {
    if (!storyId) return

    try {
      // Save words to vocabulary if any were added
      if (savedWords.length > 0) {
        await dispatch(saveWords({
          words: savedWords.map(word => ({
            word: word.word,
            translation: word.translation,
            sentence_context: word.example_sentence,
            sentence_example: word.example_sentence,
            story_id: storyId
          }))
        })).unwrap()
      }

      await dispatch(submitFeedback({
        storyId,
        feedback: {
          start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          is_skipped: false,
          question_attempts: questions.map(q => attemptCounts[q.id] || 0),
          is_liked: likeStatus === "like",
          is_disliked: likeStatus === "dislike",
          feedback_text: likeStatus === "like" ? "Story liked" : likeStatus === "dislike" ? "Story disliked" : "Story completed"
        }
      })).unwrap()

      // Clear vocabulary list after successful submission
      dispatch(clearAllWords())

      // Redirect to main page
      navigate('/')
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      // Still redirect even if feedback fails
      navigate('/')
    }
  }

  const handleLikeFeedback = async (status: "like" | "dislike") => {
    // Toggle status
    const newStatus = likeStatus === status ? null : status
    setLikeStatus(newStatus)
  }

  const handleSkip = async () => {
    if (!storyId) return

    try {
      // Save words to vocabulary if any were added
      if (savedWords.length > 0) {
        await dispatch(saveWords({
          words: savedWords.map(word => ({
            word: word.word,
            translation: word.translation,
            sentence_context: word.example_sentence,
            sentence_example: word.example_sentence,
            story_id: storyId
          }))
        })).unwrap()
      }

      await dispatch(submitFeedback({
        storyId,
        feedback: {
          start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          is_skipped: true,
          question_attempts: questions.map(q => attemptCounts[q.id] || 0),
          is_liked: likeStatus === "like",
          is_disliked: likeStatus === "dislike",
          feedback_text: "Story skipped"
        }
      })).unwrap()

      // Clear vocabulary list after successful submission
      dispatch(clearAllWords())

      // Redirect to main page
      navigate('/')
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      // Still redirect even if feedback fails
      navigate('/')
    }
  }

  const handleWordClick = async (event: React.MouseEvent) => {
    if (!storyId) return

    const target = event.target as HTMLElement
    const start = target.getAttribute('data-start')
    const end = target.getAttribute('data-end')

    if (!start || !end) return

    // Position popover near the clicked word
    const rect = target.getBoundingClientRect()
    const popoverHeight = 400 // Approximate height of popover
    const popoverWidth = 400 // Fixed width from the Card component
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom

    // Decide whether to show above or below based on available space
    const showBelow = spaceBelow > popoverHeight || spaceBelow > spaceAbove

    // Calculate horizontal positioning to keep popup within viewport
    const wordCenterX = rect.left + rect.width / 2
    const halfPopoverWidth = popoverWidth / 2
    const padding = 16 // Padding from viewport edges

    let horizontalAlign: 'left' | 'center' | 'right' = 'center'
    let x = wordCenterX

    // Check if popup would overflow on the left
    if (wordCenterX - halfPopoverWidth < padding) {
      horizontalAlign = 'left'
      x = padding + halfPopoverWidth
    }
    // Check if popup would overflow on the right
    else if (wordCenterX + halfPopoverWidth > window.innerWidth - padding) {
      horizontalAlign = 'right'
      x = window.innerWidth - padding - halfPopoverWidth
    }

    // Show popover immediately with position
    setPopoverPosition({
      x: x,
      y: showBelow ? rect.bottom + 4 : rect.top - 4,
      showBelow: showBelow,
      horizontalAlign: horizontalAlign,
    })

    // Clear previous word to show loading state
    setSelectedWord(null)

    // Fetch word details from API
    try {
      const result = await dispatch(getWordDetails({
        storyId,
        start: parseInt(start),
        end: parseInt(end),
      })).unwrap()

      setSelectedWord(result)
    } catch (error) {
      console.error('Failed to fetch word details:', error)
      // Hide popover on error
      setPopoverPosition(null)
    }
  }

  const addWordToList = () => {
    if (!selectedWord) return

    // Add to Redux vocabulary store
    const newWord: SavedWord = {
      id: `${Date.now()}-${selectedWord.expression}`,
      word: selectedWord.expression,
      translation: selectedWord.translation,
      timestamp: Date.now(),
      grammatical_info: selectedWord.grammatical_info,
      sentence_translation: selectedWord.sentence_translation,
      example_sentence: selectedWord.example_sentence,
    }
    dispatch(addWord(newWord))

    // Hide popover after adding word
    setSelectedWord(null)
    setPopoverPosition(null)
  }

  const handleRemoveWord = (id: string) => {
    dispatch(removeWord(id))
  }

  // Show full-screen loading animation while generating story
  if (isGeneratingStory) {
    return <StoryLoading />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div className="flex-1 flex flex-col p-8 overflow-auto">
        <h1 className="text-2xl font-semibold mb-8 text-foreground">
          {view === 'story' ? 'Reading Practice' : 'Quiz Time'}
        </h1>
        <div className="max-w-3xl w-full mx-auto mb-12">
          <Card className="p-8 bg-card shadow-sm">
            {view === 'story' && (
              <>
                {storyError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-destructive mb-4">Failed to generate story</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                  </div>
                ) : (
                  <div className="text-lg leading-relaxed text-card-foreground">
                    {(() => {
                      const lines = storyText.split('\n')
                      let currentPosition = 0

                      return lines.map((line, lineIndex) => {
                        const tokens = line.split(/(\s+|[.,!?;:"""''()[\]{}]+)/)

                        const lineContent = (
                          <p key={lineIndex}>
                            {tokens.map((token, tokenIndex) => {
                              // Skip empty tokens
                              if (!token) return null

                              const startPos = currentPosition
                              const endPos = currentPosition + token.length
                              currentPosition = endPos

                              // Render whitespace as-is
                              if (token.match(/^\s+$/)) {
                                return <span key={tokenIndex}>{token}</span>
                              }

                              // Render punctuation as plain text
                              if (token.match(/^[.,!?;:"""''()[\]{}]+$/)) {
                                return <span key={tokenIndex}>{token}</span>
                              }

                              // All words are clickable - translations fetched on demand
                              return (
                                <span
                                  key={tokenIndex}
                                  onClick={handleWordClick}
                                  data-start={startPos}
                                  data-end={endPos}
                                  className="cursor-pointer hover:bg-primary/15 hover:text-primary rounded px-0.5 transition-colors"
                                >
                                  {token}
                                </span>
                              )
                            })}
                          </p>
                        )

                        // Add newline character to position counter (except for last line)
                        if (lineIndex < lines.length - 1) {
                          currentPosition += 1
                        }

                        return lineContent
                      })
                    })()}
                  </div>
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
          </Card>

          {view === 'story' && !storyError && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleFinish} 
                size="lg" 
                className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoadingQuestions}
              >
                {isLoadingQuestions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading questions...
                  </>
                ) : (
                  'Finish'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Translation popover */}
      {popoverPosition && (
        <div
          ref={popoverRef}
          className="fixed z-50 animate-in fade-in zoom-in-95 duration-200"
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1" onClick={() => { setSelectedWord(null); setPopoverPosition(null); }}>
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
                  onClick={addWordToList}
                  disabled={savedWords.some(w => w.word.toLowerCase() === selectedWord.expression.toLowerCase())}
                >
                  <Plus className="h-4 w-4" />
                  {savedWords.some(w => w.word.toLowerCase() === selectedWord.expression.toLowerCase())
                    ? "Already in list"
                    : "Add to vocabulary list"}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Desktop Vocabulary Sidebar */}
      <div className="hidden lg:block w-80 border-l border-border">
        <VocabularyList savedWords={savedWords} onRemoveWord={handleRemoveWord} />
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setIsVocabDrawerOpen(true)}
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
      {isVocabDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsVocabDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Bottom Drawer */}
      {isVocabDrawerOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar rounded-t-2xl z-50 max-h-[70vh] overflow-auto animate-in slide-in-from-bottom duration-300">
          <div className="sticky top-0 bg-sidebar p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Vocabulary List</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVocabDrawerOpen(false)}
              aria-label="Close vocabulary list"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <VocabularyList savedWords={savedWords} onRemoveWord={handleRemoveWord} />
        </div>
      )}
    </div>
  )
}
