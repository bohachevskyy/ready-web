import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Brain, Clock, Volume2, VolumeX } from "lucide-react"
import { SpeakerButton } from "./ui/speaker-button"
import { DuoButton } from "./ui/duo-button"
import { DuoCard } from "./ui/duo-card"
import { useAppDispatch, useAppSelector } from "../store/store"
import { fetchWords, submitWordReview, nextWord, clearWords, setSessionTotal } from "../store/wordsSlice"
import { toggleAutoPlay } from "../store/speechSettingsSlice"
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis"
import { useWordCount } from "../hooks/useWordCount"
import { usePracticeKeyboard } from "../hooks/usePracticeKeyboard"
import { usePracticeSession } from "../hooks/usePracticeSession"
import { useAutoPlayPronunciation } from "../hooks/useAutoPlayPronunciation"
import { useTranslation } from "../i18n/useTranslation"
import { logEvent } from "../services/analyticsService"
import { wordToCard, calculateNextReview, calculateScheduledDays, type FSRSCard } from "../services/fsrsService"
import { cn } from "../lib/utils"

type Rating = "again" | "hard" | "good" | "easy"

const RATING_COLORS: Record<
  Rating,
  { bg: string; border: string; text: string; shadow: string; key: string }
> = {
  again: {
    bg: "bg-[#FFE3E6]",
    border: "border-heart",
    text: "text-heart-deep",
    shadow: "shadow-[0_4px_0_hsl(var(--heart-deep))]",
    key: "1",
  },
  hard: {
    bg: "bg-[#FFEEDF]",
    border: "border-[#D67742]",
    text: "text-[#A14E1F]",
    shadow: "shadow-[0_4px_0_#A14E1F]",
    key: "2",
  },
  good: {
    bg: "bg-green-soft",
    border: "border-green",
    text: "text-green-ink",
    shadow: "shadow-[0_4px_0_hsl(var(--green-deep))]",
    key: "3",
  },
  easy: {
    bg: "bg-brand-blue-soft",
    border: "border-brand-blue",
    text: "text-brand-blue-deep",
    shadow: "shadow-[0_4px_0_hsl(var(--blue-deep))]",
    key: "4",
  },
}

export function PracticeWords() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cards, setCards] = useState<FSRSCard[]>([])
  const [showTranslation, setShowTranslation] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [highlightedRating, setHighlightedRating] = useState<Rating | null>(null)

  const dispatch = useAppDispatch()
  const {
    words: apiWords,
    isLoading,
    error,
    lastWordId,
    hasNextPage,
    currentIndex,
    sessionTotal,
  } = useAppSelector((state) => state.words)

  const { autoPlayEnabled, speechRate } = useAppSelector((state) => state.speechSettings)
  const { speak, cancel, supported } = useSpeechSynthesis()
  const { wordsCount } = useWordCount()
  const { shouldContinueSession } = usePracticeSession()

  useEffect(() => {
    dispatch(clearWords())
    dispatch(fetchWords({ limit: 15 }))
  }, [dispatch])

  useEffect(() => {
    if (wordsCount !== undefined && wordsCount > 0) {
      dispatch(setSessionTotal(wordsCount))
    }
  }, [wordsCount, dispatch])

  useEffect(() => {
    if (apiWords && apiWords.length > 0) {
      setCards(apiWords.map(wordToCard))
      setSessionComplete(false)
      setIsActive(true)
    } else if (apiWords.length === 0 && !isLoading && cards.length === 0) {
      setSessionComplete(true)
      setIsActive(false)
    }
  }, [apiWords, isLoading, cards.length])

  useEffect(() => {
    if (currentIndex === 9 && hasNextPage && lastWordId) {
      dispatch(fetchWords({ afterId: lastWordId, limit: 15 }))
    }
  }, [currentIndex, hasNextPage, lastWordId, dispatch])

  useAutoPlayPronunciation({
    autoPlayEnabled,
    supported,
    cards,
    currentIndex,
    speechRate,
    sessionComplete,
    speak,
  })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && !sessionComplete) {
      interval = setInterval(() => setTimer((p) => p + 1), 1000)
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

  const handleRating = useCallback(
    async (rating: Rating) => {
      const currentCard = cards[currentIndex]
      const updatedCard = calculateNextReview(currentCard, rating)
      logEvent('word_practiced', { word: currentCard.word, rating })
      cancel()

      try {
        await dispatch(submitWordReview({ wordId: currentCard.id, rating })).unwrap()
        const newCards = [...cards]
        newCards[currentIndex] = updatedCard
        setCards(newCards)

        const updatedWordsCount =
          wordsCount !== undefined && wordsCount > 0 ? wordsCount - 1 : wordsCount

        const shouldContinue = shouldContinueSession({
          currentIndex,
          totalCards: cards.length,
          sessionTotal,
          wordsCount: updatedWordsCount,
        })

        if (shouldContinue) {
          dispatch(nextWord())
          setShowTranslation(false)
          setTimer(0)
        } else {
          setSessionComplete(true)
          setIsActive(false)
          dispatch(clearWords())
        }
      } catch (err) {
        console.error('Failed to submit review:', err)
      }
    },
    [cards, currentIndex, cancel, dispatch, sessionTotal, wordsCount, shouldContinueSession],
  )

  const handleShowTranslation = useCallback(() => setShowTranslation(true), [])

  const handleKeyboardRate = useCallback(
    (rating: Rating) => {
      setHighlightedRating(rating)
      setTimeout(() => {
        setHighlightedRating(null)
        handleRating(rating)
      }, 300)
    },
    [handleRating],
  )

  usePracticeKeyboard({
    showTranslation,
    onShowTranslation: handleShowTranslation,
    onRate: handleKeyboardRate,
  })

  // ── Loading / error / empty / complete states ────────────────────
  if (isLoading) {
    return (
      <CenterPanel>
        <div className="w-16 h-16 bg-green-soft rounded-full grid place-items-center mx-auto animate-pulse text-green">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mt-4">{t('practice.loadingWords')}</h2>
      </CenterPanel>
    )
  }

  if (error) {
    return (
      <CenterPanel>
        <h2 className="text-2xl font-black text-heart-deep">{t('practice.errorLoading')}</h2>
        <p className="text-ink-mute mt-2">{t('practice.tryAgainLater')}</p>
      </CenterPanel>
    )
  }

  if ((apiWords.length === 0 && !isLoading) || cards.length === 0) {
    return (
      <CenterPanel>
        <div className="w-16 h-16 bg-green-soft rounded-full grid place-items-center mx-auto text-green">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mt-4">{t('practice.noWords')}</h2>
        <p className="text-ink-mute mt-2">{t('practice.comeBackLater')}</p>
        <div className="pt-5">
          <DuoButton size="lg" onClick={() => navigate('/')}>
            {t('practice.goHome')}
          </DuoButton>
        </div>
      </CenterPanel>
    )
  }

  if (sessionComplete) {
    return (
      <div className="bg-green-soft min-h-[calc(100vh-64px)] grid place-items-center p-10">
        <DuoCard className="anim-bounce max-w-[480px] p-9 text-center bg-green-soft border-[#BBE3A0]">
          <div className="text-[56px] mb-2">🎉</div>
          <h1 className="font-black text-[32px] m-0 mb-2">{t('practice.sessionComplete')}</h1>
          <p className="text-ink-soft text-[15px] m-0">
            {t('practice.sessionCompleteMessage', { count: cards.length })}
          </p>
          <div className="flex gap-2.5 justify-center mt-6">
            <DuoButton variant="secondary" onClick={() => navigate('/')}>
              {t('common.home') || 'Home'}
            </DuoButton>
            <DuoButton onClick={() => window.location.reload()}>
              {t('practice.startNewSession')}
            </DuoButton>
          </div>
        </DuoCard>
      </div>
    )
  }

  const remainingCards = wordsCount !== undefined ? wordsCount : cards.length - currentIndex
  const displayTotal =
    sessionTotal && wordsCount !== undefined
      ? sessionTotal
      : cards.length > 0
      ? cards.length
      : 0
  const currentCardNumber =
    sessionTotal && wordsCount !== undefined
      ? Math.min(sessionTotal - wordsCount + 1, sessionTotal)
      : currentIndex + 1

  const currentCard = cards[currentIndex]

  return (
    <div className="bg-green-soft min-h-[calc(100vh-64px)] py-6 px-8 pb-16">
      <div className="max-w-[880px] mx-auto space-y-4">
        {/* Header chip */}
        <div className="anim-slide bg-paper border-2 border-green rounded-[16px] px-5 py-3.5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-soft text-green grid place-items-center">
            <Brain className="w-[26px] h-[26px]" />
          </div>
          <div className="flex-1">
            <div className="text-ink-mute text-[13px] font-bold">
              {t('practice.cardsRemaining')}
            </div>
            <div className="text-[26px] font-black text-green leading-[1]">{remainingCards}</div>
          </div>
          {supported && (
            <button
              type="button"
              onClick={() => dispatch(toggleAutoPlay())}
              title={
                autoPlayEnabled ? t('practice.autoPlayDisable') : t('practice.autoPlayEnable')
              }
              className={cn(
                "border-2 border-line bg-paper rounded-[10px] px-3 py-2 cursor-pointer",
                "font-bold text-[13px] flex items-center gap-1.5 font-sans",
                autoPlayEnabled ? "text-green" : "text-ink-mute",
              )}
            >
              {autoPlayEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('practice.autoPlay')}</span>
            </button>
          )}
          <div className="border-2 border-green rounded-[10px] px-3.5 py-2 flex items-center gap-1.5 text-green font-black font-mono text-base">
            <Clock className="w-4 h-4" />
            {formatTime(timer)}
          </div>
        </div>

        {/* Card */}
        <DuoCard key={currentIndex} className="anim-slide overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-line bg-[#FCFAF2]">
            <div className="text-ink-mute text-sm font-bold">
              {t('practice.cardProgress', { current: currentCardNumber, total: displayTotal })}
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-soft text-green-ink text-[13px] font-extrabold capitalize border-2 border-transparent">
                {t(`practice.states.${currentCard.state}`)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-paper border-2 border-line text-ink text-[13px] font-extrabold">
                {t('practice.reps', { count: currentCard.reps })}
              </span>
            </div>
          </div>

          <div className="px-5 pt-14 pb-10 text-center">
            <div className="text-ink-mute text-sm font-bold">{t('practice.englishWord')}</div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-[64px] font-black text-green tracking-tight leading-[1]">
                {currentCard.word}
              </div>
              <SpeakerButton text={currentCard.word} size="lg" />
            </div>

            {!showTranslation ? (
              <DuoButton
                variant="secondary"
                onClick={handleShowTranslation}
                className="mt-7 px-7"
              >
                {t('practice.showTranslation')}
              </DuoButton>
            ) : (
              <div className="anim-bounce mt-5">
                <div className="text-ink-mute text-[13px] font-mono">
                  {/* IPA placeholder removed; show only translation */}
                </div>
                <div className="text-[28px] font-extrabold mt-2">
                  {currentCard.translation || t('practice.noTranslation')}
                </div>
                {currentCard.sentenceContext && (
                  <div
                    className="font-serif text-[17px] italic mt-4 px-4 py-3 bg-cream-2 rounded-[10px] border-l-[3px] border-gold inline-block text-ink-soft"
                  >
                    {currentCard.sentenceContext}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rating row */}
          <div className="px-5 pb-5 pt-1.5">
            <div className="grid grid-cols-4 gap-3">
              {(['again', 'hard', 'good', 'easy'] as Rating[]).map((r) => {
                const colors = RATING_COLORS[r]
                const interval =
                  r === 'again'
                    ? '<1d'
                    : `${Math.round(calculateScheduledDays(currentCard.stability, r))}d`
                const highlighted = highlightedRating === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRating(r)}
                    disabled={!showTranslation}
                    className={cn(
                      'group relative rounded-[14px] px-2.5 py-4 cursor-pointer font-sans border-2 transition-[transform,box-shadow] duration-100',
                      'disabled:cursor-not-allowed',
                      showTranslation
                        ? cn(colors.bg, colors.border, colors.text, colors.shadow)
                        : 'bg-[#FAF6E8] border-line text-ink-mute',
                      highlighted && 'translate-y-[3px]',
                    )}
                  >
                    {showTranslation && (
                      <span
                        className="absolute top-1.5 right-2 text-[10px] font-black opacity-55 font-mono"
                      >
                        {colors.key}
                      </span>
                    )}
                    <div className="text-[18px] font-black">{t(`practice.ratings.${r}`)}</div>
                    <div className="text-[12px] font-bold mt-1 opacity-80">{interval}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </DuoCard>

        {/* Keyboard hint */}
        <DuoCard className="p-4 text-center bg-[#FAF6E8] shadow-none">
          <span className="text-ink-mute text-sm font-semibold">
            {t('practice.instruction')}
          </span>
        </DuoCard>
      </div>
    </div>
  )
}

function CenterPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-green-soft min-h-[calc(100vh-64px)] grid place-items-center p-4">
      <DuoCard className="w-full max-w-lg p-7 text-center">{children}</DuoCard>
    </div>
  )
}
