import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { SpeakerButton } from "./ui/speaker-button"
import { Brain, Clock, Volume2, VolumeX } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../store/store"
import { fetchWords, submitWordReview, nextWord, clearWords, setSessionTotal } from "../store/wordsSlice"
import { toggleAutoPlay } from "../store/speechSettingsSlice"
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis"
import { useWordCount } from "../hooks/useWordCount"
import { usePracticeKeyboard } from "../hooks/usePracticeKeyboard"
import { useTranslation } from "../i18n/useTranslation"
import { wordToCard, calculateNextReview, calculateScheduledDays, type FSRSCard } from "../services/fsrsService"

export function PracticeWords() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cards, setCards] = useState<FSRSCard[]>([])
  const [showTranslation, setShowTranslation] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [highlightedRating, setHighlightedRating] = useState<string | null>(null)

  // Redux state and dispatch
  const dispatch = useAppDispatch()
  const {
    words: apiWords,
    isLoading,
    error,
    lastWordId,
    hasNextPage,
    currentIndex,
    sessionTotal
  } = useAppSelector((state) => state.words)

  const { autoPlayEnabled, speechRate } = useAppSelector((state) => state.speechSettings)

  // Speech synthesis hook
  const { speak, cancel, supported } = useSpeechSynthesis()

  // Word count hook (auto-fetches when undefined)
  const { wordsCount } = useWordCount()

  // Initialize cards from Redux state - fetch on mount
  useEffect(() => {
    // Clear any previous session data
    dispatch(clearWords())
    // Fetch fresh data
    dispatch(fetchWords({ limit: 15 }))
  }, [dispatch])

  // Initialize session total when words count is available
  useEffect(() => {
    if (wordsCount !== undefined && wordsCount > 0) {
      dispatch(setSessionTotal(wordsCount))
    }
  }, [wordsCount, dispatch])

  // Update cards when apiWords changes
  useEffect(() => {
    if (apiWords && apiWords.length > 0) {
      setCards(apiWords.map(wordToCard))
      setSessionComplete(false) // Reset session complete when we have words
      setIsActive(true) // Make sure timer is active
    } else if (apiWords.length === 0 && !isLoading && cards.length === 0) {
      // Only set session complete if we actually finished reviewing cards
      // Not just because we cleared the state
      setSessionComplete(true)
      setIsActive(false)
    }
  }, [apiWords, isLoading, cards.length])

  // Prefetch next page at word 10
  useEffect(() => {
    if (currentIndex === 9 && hasNextPage && lastWordId) {
      dispatch(fetchWords({ afterId: lastWordId, limit: 15 }))
    }
  }, [currentIndex, hasNextPage, lastWordId, dispatch])

  // Auto-play pronunciation when card changes
  useEffect(() => {
    if (autoPlayEnabled && supported && cards.length > 0 && cards[currentIndex]) {
      // Small delay to prevent immediate play on mount and give smooth transition
      const timer = setTimeout(() => {
        speak(cards[currentIndex].word, { rate: speechRate })
      }, 300)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [currentIndex, autoPlayEnabled, supported, cards, speak, speechRate])

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

  const handleRating = useCallback(async (rating: "again" | "hard" | "good" | "easy") => {
    const currentCard = cards[currentIndex]
    const updatedCard = calculateNextReview(currentCard, rating)

    // Cancel any ongoing speech before moving to next card
    cancel()

    try {
      // Dispatch thunk - optimistic count decrement happens in pending state
      await dispatch(submitWordReview({ wordId: currentCard.id, rating })).unwrap()

      // Only update local card state on success
      const newCards = [...cards]
      newCards[currentIndex] = updatedCard
      setCards(newCards)

      // Move to next card - Redux manages currentIndex
      if (currentIndex < cards.length - 1) {
        dispatch(nextWord())
        setShowTranslation(false)
        setTimer(0)
      } else {
        setSessionComplete(true)
        setIsActive(false)
        // Clear Redux words state to force fresh fetch on next session
        dispatch(clearWords())
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      // Optimistic update already rolled back in rejected state
    }
  }, [cards, currentIndex, cancel, dispatch])

  const handleShowTranslation = useCallback(() => {
    setShowTranslation(true)
  }, [])

  // Keyboard rating with visual feedback
  const handleKeyboardRate = useCallback((rating: "again" | "hard" | "good" | "easy") => {
    setHighlightedRating(rating)
    setTimeout(() => {
      setHighlightedRating(null)
      handleRating(rating)
    }, 300)
  }, [handleRating])

  // Keyboard navigation hook
  usePracticeKeyboard({
    showTranslation,
    onShowTranslation: handleShowTranslation,
    onRate: handleKeyboardRate,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t('practice.loadingWords')}</h2>
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
            <h2 className="text-2xl font-bold text-red-600">{t('practice.errorLoading')}</h2>
            <p className="text-muted-foreground">{t('practice.tryAgainLater')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check for empty state: no words to practice
  if ((apiWords.length === 0 && !isLoading) || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t('practice.noWords')}</h2>
            <p className="text-muted-foreground">
              {t('practice.comeBackLater')}
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/')}
              >
                {t('practice.goHome')}
              </Button>
            </div>
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
            <h2 className="text-2xl font-bold">{t('practice.sessionComplete')}</h2>
            <p className="text-muted-foreground">
              {t('practice.sessionCompleteMessage', { count: cards.length })}
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => {
                  window.location.reload()
                }}
              >
                {t('practice.startNewSession')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use sessionTotal if available, fallback to wordsCount or calculated remaining
  const remainingCards = wordsCount !== undefined ? wordsCount : cards.length - currentIndex
  
  const displayTotal = sessionTotal && wordsCount !== undefined 
    ? sessionTotal 
    : (cards.length > 0 ? cards.length : 0)

  // Ensure current card number doesn't exceed total
  const currentCardNumber = sessionTotal && wordsCount !== undefined 
    ? Math.min((sessionTotal - wordsCount) + 1, sessionTotal)
    : currentIndex + 1

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
              <p className="text-sm text-muted-foreground font-medium">{t('practice.cardsRemaining')}</p>
              <p className="text-4xl font-bold text-primary">{remainingCards}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {supported && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(toggleAutoPlay())}
                className="gap-2"
                title={autoPlayEnabled ? t('practice.autoPlayDisable') : t('practice.autoPlayEnable')}
              >
                {autoPlayEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('practice.autoPlay')}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('practice.autoPlay')}</span>
                  </>
                )}
              </Button>
            )}
            <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-lg border-2 border-primary/30">
              <Clock className="w-6 h-6 text-primary" />
              <span className="font-mono text-2xl font-bold text-primary">{formatTime(timer)}</span>
            </div>
          </div>
        </div>

        <Card className="border-4 border-primary/30 shadow-2xl bg-card">
          <CardHeader className="border-b-2 border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-muted-foreground">
                {t('practice.cardProgress', { current: currentCardNumber, total: displayTotal })}
              </CardTitle>
              <div className="flex gap-2">
                <span className="text-sm px-3 py-1.5 bg-primary/20 text-primary rounded-full capitalize font-medium">
                  {t(`practice.states.${currentCard.state}`)}
                </span>
                <span className="text-sm px-3 py-1.5 bg-muted rounded-full font-medium">{t('practice.reps', { count: currentCard.reps })}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-16 pb-8">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <p className="text-base text-muted-foreground font-medium">{t('practice.englishWord')}</p>
                <div className="flex items-center justify-center gap-4">
                  <h2 className="text-6xl font-bold text-primary">{currentCard.word}</h2>
                  <SpeakerButton
                    text={currentCard.word}
                    size="lg"
                  />
                </div>
              </div>

              {showTranslation ? (
                <div className="space-y-6 pt-8 border-t-2">
                  <div className="space-y-2">
                    <p className="text-base text-muted-foreground font-medium">{t('practice.translation')}</p>
                    <h3 className="text-3xl font-bold text-foreground">
                      {currentCard.translation || t('practice.noTranslation')}
                    </h3>
                  </div>
                  {currentCard.sentenceContext && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">{t('practice.exampleSentence')}</p>
                      <p className="text-lg text-muted-foreground italic">
                        {currentCard.sentenceContext}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShowTranslation}
                  className="mt-8 bg-transparent text-lg px-8 py-6"
                >
                  {t('practice.showTranslation')}
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
                  className={`group h-24 flex flex-col gap-2 border-2 transition-all duration-150 hover:border-red-500 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none ${
                    highlightedRating === 'again' ? 'border-red-500 bg-red-100 text-red-700 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-base">{t('practice.ratings.again')}</span>
                    <span className={`transition-opacity text-xs text-muted-foreground ${highlightedRating === 'again' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>(1)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">&lt;1 day</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRating("hard")}
                  disabled={!showTranslation}
                  className={`group h-24 flex flex-col gap-2 border-2 transition-all duration-150 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 disabled:pointer-events-none ${
                    highlightedRating === 'hard' ? 'border-orange-500 bg-orange-100 text-orange-700 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-base">{t('practice.ratings.hard')}</span>
                    <span className={`transition-opacity text-xs text-muted-foreground ${highlightedRating === 'hard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>(2)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(calculateScheduledDays(cards[currentIndex].stability, 'hard'))}d
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRating("good")}
                  disabled={!showTranslation}
                  className={`group h-24 flex flex-col gap-2 border-2 transition-all duration-150 hover:border-green-500 hover:bg-green-50 hover:text-green-700 disabled:pointer-events-none ${
                    highlightedRating === 'good' ? 'border-green-500 bg-green-100 text-green-700 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-base">{t('practice.ratings.good')}</span>
                    <span className={`transition-opacity text-xs text-muted-foreground ${highlightedRating === 'good' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>(3)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(calculateScheduledDays(cards[currentIndex].stability, 'good'))}d
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRating("easy")}
                  disabled={!showTranslation}
                  className={`group h-24 flex flex-col gap-2 border-2 transition-all duration-150 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none ${
                    highlightedRating === 'easy' ? 'border-blue-500 bg-blue-100 text-blue-700 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-base">{t('practice.ratings.easy')}</span>
                    <span className={`transition-opacity text-xs text-muted-foreground ${highlightedRating === 'easy' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>(4)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(calculateScheduledDays(cards[currentIndex].stability, 'easy'))}d
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
              {t('practice.instruction')}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
