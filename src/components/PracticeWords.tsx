import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Brain, Clock } from "lucide-react"
import { useGetWordsQuery, useLazyGetWordsQuery, useGetWordsCountQuery, useSubmitReviewMutation } from "../services/wordsApi"
import { Word } from "../types"

// FSRS Card data structure for UI
type FSRSCard = {
  id: string
  word: string
  sentenceContext?: string
  due: Date
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: "new" | "learning" | "review" | "relearning"
}

// Convert API Word to FSRSCard
function wordToCard(word: Word): FSRSCard {
  return {
    id: word.id,
    word: word.name,
    sentenceContext: word.sentence_context,
    due: new Date(word.due_at),
    stability: word.stability,
    difficulty: word.difficulty,
    elapsedDays: word.elapsed_days,
    scheduledDays: word.scheduled_days,
    reps: word.reps,
    lapses: word.lapses,
    state: word.state.toLowerCase() as "new" | "learning" | "review" | "relearning",
  }
}

// Simplified FSRS algorithm for UI preview (actual calculation is server-side)
function calculateNextReview(card: FSRSCard, rating: "again" | "hard" | "good" | "easy"): FSRSCard {
  const now = new Date()
  let newStability = card.stability
  let newDifficulty = card.difficulty
  let scheduledDays = 0

  // Initialize difficulty for new cards
  if (card.state === "new") {
    newDifficulty = 5
  }

  switch (rating) {
    case "again":
      newStability = Math.max(1, card.stability * 0.5)
      newDifficulty = Math.min(10, card.difficulty + 2)
      scheduledDays = 0.1 // 2.4 hours
      break
    case "hard":
      newStability = card.stability * 1.2
      newDifficulty = Math.min(10, card.difficulty + 0.5)
      scheduledDays = Math.max(1, card.stability * 1.2)
      break
    case "good":
      newStability = card.stability === 0 ? 1 : card.stability * 2.5
      scheduledDays = Math.max(1, newStability)
      break
    case "easy":
      newStability = card.stability === 0 ? 4 : card.stability * 4
      newDifficulty = Math.max(1, card.difficulty - 1)
      scheduledDays = Math.max(1, newStability)
      break
  }

  const dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000)

  return {
    ...card,
    stability: newStability,
    difficulty: newDifficulty,
    scheduledDays,
    due: dueDate,
    reps: card.reps + 1,
    lapses: rating === "again" ? card.lapses + 1 : card.lapses,
    state: rating === "again" ? "relearning" : card.state === "new" ? "learning" : "review",
  }
}

export function PracticeWords() {
  const [cards, setCards] = useState<FSRSCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [lastWordId, setLastWordId] = useState<string | undefined>(undefined)
  const [hasNextPage, setHasNextPage] = useState(true)

  // API hooks
  const { data: initialWords, isLoading, error } = useGetWordsQuery({ limit: 15 })
  const [fetchNextPage, { data: nextWords }] = useLazyGetWordsQuery()
  const { data: wordsCount } = useGetWordsCountQuery({})
  const [submitReview] = useSubmitReviewMutation()

  // Initialize cards from API
  useEffect(() => {
    if (initialWords && initialWords.length > 0) {
      setCards(initialWords.map(wordToCard))
      setLastWordId(initialWords[initialWords.length - 1].id)
      setHasNextPage(initialWords.length === 15)
    } else if (initialWords && initialWords.length === 0) {
      setSessionComplete(true)
      setIsActive(false)
    }
  }, [initialWords])

  // Append next page of words
  useEffect(() => {
    if (nextWords && nextWords.length > 0) {
      setCards(prev => [...prev, ...nextWords.map(wordToCard)])
      setLastWordId(nextWords[nextWords.length - 1].id)
      setHasNextPage(nextWords.length === 15)
    } else if (nextWords && nextWords.length === 0) {
      setHasNextPage(false)
    }
  }, [nextWords])

  // Prefetch next page at word 10
  useEffect(() => {
    if (currentIndex === 9 && hasNextPage && lastWordId) {
      fetchNextPage({ afterId: lastWordId, limit: 15 })
    }
  }, [currentIndex, hasNextPage, lastWordId, fetchNextPage])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !sessionComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, sessionComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleRating = async (rating: "again" | "hard" | "good" | "easy") => {
    const currentCard = cards[currentIndex]
    const updatedCard = calculateNextReview(currentCard, rating)

    // Submit review to the server immediately
    try {
      await submitReview({ wordId: currentCard.id, rating }).unwrap()
    } catch (error) {
      console.error('Failed to submit review:', error)
    }

    // Update the cards array
    const newCards = [...cards]
    newCards[currentIndex] = updatedCard
    setCards(newCards)

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowTranslation(false)
      setTimer(0)
    } else {
      setSessionComplete(true)
      setIsActive(false)
    }
  }

  const handleShowTranslation = () => {
    setShowTranslation(true)
  }

  const remainingCards = wordsCount?.count || cards.length - currentIndex

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Loading words...</h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-2 border-red-200">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Error loading words</h2>
            <p className="text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground">
              Great job! You've reviewed all {cards.length} cards in this session.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => {
                  window.location.reload()
                }}
              >
                Start New Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">No words to practice</h2>
            <p className="text-muted-foreground">
              Come back later when words are due for review.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with stats */}
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border-2 border-primary shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Cards Remaining</p>
              <p className="text-4xl font-bold text-primary">{remainingCards}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-lg border-2 border-primary/30">
            <Clock className="w-6 h-6 text-primary" />
            <span className="font-mono text-2xl font-bold text-primary">{formatTime(timer)}</span>
          </div>
        </div>

        <Card className="border-4 border-primary/30 shadow-2xl bg-card">
          <CardHeader className="border-b-2 border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-muted-foreground">
                Card {currentIndex + 1} of {cards.length}
              </CardTitle>
              <div className="flex gap-2">
                <span className="text-sm px-3 py-1.5 bg-primary/20 text-primary rounded-full capitalize font-medium">
                  {currentCard.state}
                </span>
                <span className="text-sm px-3 py-1.5 bg-muted rounded-full font-medium">Reps: {currentCard.reps}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-16 pb-8">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <p className="text-base text-muted-foreground font-medium">English Word</p>
                <h2 className="text-6xl font-bold text-primary">{currentCard.word}</h2>
              </div>

              {showTranslation ? (
                <div className="space-y-4 pt-8 border-t-2">
                  <p className="text-base text-muted-foreground font-medium">Example Sentence</p>
                  <h3 className="text-2xl font-semibold text-foreground italic">
                    {currentCard.sentenceContext || "No example available"}
                  </h3>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShowTranslation}
                  className="mt-8 bg-transparent text-lg px-8 py-6"
                >
                  Show Example
                </Button>
              )}
            </div>

            <div className="mt-12 pt-8 border-t-2 border-border/50">
              <div
                className={`grid grid-cols-4 gap-4 transition-opacity duration-300 ${!showTranslation ? "opacity-40" : "opacity-100"}`}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRating("again")}
                  disabled={!showTranslation}
                  className="h-24 flex flex-col gap-2 border-2 hover:border-red-500 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none"
                >
                  <span className="font-semibold text-base">Again</span>
                  <span className="text-xs text-muted-foreground">&lt;1 day</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRating("hard")}
                  disabled={!showTranslation}
                  className="h-24 flex flex-col gap-2 border-2 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 disabled:pointer-events-none"
                >
                  <span className="font-semibold text-base">Hard</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(Math.max(1, cards[currentIndex].stability * 1.2))}d
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRating("good")}
                  disabled={!showTranslation}
                  className="h-24 flex flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50 hover:text-green-700 disabled:pointer-events-none"
                >
                  <span className="font-semibold text-base">Good</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(
                      Math.max(1, cards[currentIndex].stability === 0 ? 1 : cards[currentIndex].stability * 2.5),
                    )}
                    d
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRating("easy")}
                  disabled={!showTranslation}
                  className="h-24 flex flex-col gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none"
                >
                  <span className="font-semibold text-base">Easy</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(
                      Math.max(1, cards[currentIndex].stability === 0 ? 4 : cards[currentIndex].stability * 4),
                    )}
                    d
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {!showTranslation && (
          <Card className="bg-muted/50 border-primary/20">
            <CardContent className="pt-4 text-center text-sm text-muted-foreground">
              Click "Show Example" to see the word in context, then rate how well you knew this word.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
