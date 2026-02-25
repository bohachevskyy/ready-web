import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import { VocabularyList } from "../VocabularyList"
import { QuizView } from "../QuizView"
import { StoryLoading } from "../StoryLoading"
import { Toast } from "../ui/toast"
import { useStoryReader } from "./useStoryReader"
import { StoryContent } from "./StoryContent"
import { WordPopover } from "./WordPopover"
import { WordDrawer } from "./WordDrawer"
import { VocabDrawer } from "./VocabDrawer"
import { CompletionBanner } from "./CompletionBanner"
import { ReadingProgress } from "../ReadingProgress"
import { useTranslation } from "../../i18n/useTranslation"
import { useTranslationHint } from "./useTranslationHint"
import { TranslationHintTip } from "./TranslationHintTip"

/** Extract a readable title from the story text as a placeholder */
function extractTitle(text: string): string {
  if (!text) return ''
  // Try first sentence (up to 160 chars is fine for a title)
  const match = text.match(/^(.+?[.!?])\s/)
  if (match && match[1].length <= 160) {
    return match[1]
  }
  // If the first sentence is too long, find a natural break (comma, semicolon, dash)
  const firstLine = text.split('\n')[0] || ''
  const breakMatch = firstLine.slice(0, 100).match(/^(.{30,}?)[,;—–]\s/)
  if (breakMatch) {
    return breakMatch[1] + '...'
  }
  // Last resort: truncate at word boundary
  if (firstLine.length <= 100) return firstLine
  const truncated = firstLine.slice(0, 90)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

export function StoryReader() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isBannerDismissed, setIsBannerDismissed] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const { t } = useTranslation()

  const {
    // State
    view,
    storyText,
    storyError,
    savedWords,
    selectedWord,
    popoverPosition,
    questions,
    likeStatus,
    feedbackSubmitted,
    isGeneratingStory,
    isFetchingStory,
    isLoadingQuestions,
    isVocabDrawerOpen,
    isWordDrawerOpen,
    translationError,
    saveWordError,
    popoverRef,
    readerStatus,

    // Handlers
    handleWordClick,
    handleFinish,
    handleComplete,
    handleSkip,
    handleLikeFeedback,
    handleAttempt,
    handleRemoveWord,
    addWordToList,
    addWordToListAndCloseDrawer,
    closePopover,
    closeWordDrawer,
    openVocabDrawer,
    closeVocabDrawer,
    clearTranslationError,
    clearSaveWordError,
  } = useStoryReader()

  const { showHintTip, dismissHint } = useTranslationHint()

  // Track scroll progress
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const maxScroll = scrollHeight - clientHeight
    if (maxScroll <= 0) {
      setScrollProgress(100)
      return
    }
    setScrollProgress(Math.round((scrollTop / maxScroll) * 100))
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Scroll to top when transitioning to questions view
  useEffect(() => {
    if (view === 'questions' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [view])

  // Determine if story is completed
  const isCompleted = readerStatus?.status === 'completed' || !!readerStatus?.completed_at
  const showCompletionBanner = isCompleted && !isBannerDismissed && view === 'story'

  // Extract title from story text
  const storyTitle = useMemo(() => extractTitle(storyText), [storyText])

  // Show full-screen loading animation while generating or fetching story
  if (isGeneratingStory || isFetchingStory) {
    return <StoryLoading />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div ref={scrollContainerRef} className="flex-1 flex flex-col overflow-auto relative">
        {/* Reading progress bar */}
        {view === 'story' && <ReadingProgress progress={scrollProgress} />}

        <div className="max-w-prose w-full mx-auto px-6 sm:px-8 pt-10 pb-16">
          {view === 'story' && storyTitle && (
            <header className="mb-10">
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-foreground tracking-tight">
                {storyTitle}
              </h1>
              <div className="mt-4 h-px bg-border/60 w-16" />
            </header>
          )}

          {view === 'questions' && (
            <header className="mb-10">
              <h1 className="text-2xl font-semibold text-foreground">
                {t('storyReader.quizTime')}
              </h1>
            </header>
          )}

          {showCompletionBanner && (
            <CompletionBanner
              completedAt={readerStatus?.completed_at || null}
              onDismiss={() => setIsBannerDismissed(true)}
            />
          )}

          {view === 'story' && (
            <StoryContent
              storyText={storyText}
              storyError={storyError}
              onWordClick={handleWordClick}
            />
          )}

          {view === 'questions' && (
            <Card className="p-8 bg-card shadow-sm">
              <QuizView
                questions={questions}
                isLoading={isLoadingQuestions}
                onComplete={handleComplete}
                onSkip={handleSkip}
                onLikeFeedback={handleLikeFeedback}
                onAttempt={handleAttempt}
                likeStatus={likeStatus}
                feedbackSubmitted={feedbackSubmitted}
              />
            </Card>
          )}

          {view === 'story' && !storyError && !isCompleted && (
            <div className="flex justify-center mt-12 mb-8">
              <Button
                onClick={handleFinish}
                size="lg"
                className="px-10 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-base font-medium shadow-sm transition-all hover:shadow-md"
                disabled={isLoadingQuestions}
              >
                {isLoadingQuestions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('storyReader.loadingQuestions')}
                  </>
                ) : (
                  t('storyReader.finish')
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Translation popover (desktop) */}
      <WordPopover
        popoverRef={popoverRef}
        popoverPosition={popoverPosition}
        selectedWord={selectedWord}
        savedWords={savedWords}
        onClose={closePopover}
        onAddWord={addWordToList}
      />

      {/* Desktop Vocabulary Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-80 bg-sidebar/50 border-l border-border/40">
        <VocabularyList savedWords={savedWords} onRemoveWord={handleRemoveWord} />
      </div>

      {/* Mobile Vocabulary FAB + Drawer */}
      <VocabDrawer
        isOpen={isVocabDrawerOpen}
        savedWords={savedWords}
        onOpen={openVocabDrawer}
        onClose={closeVocabDrawer}
        onRemoveWord={handleRemoveWord}
      />

      {/* Mobile Word Details Drawer */}
      <WordDrawer
        isOpen={isWordDrawerOpen}
        selectedWord={selectedWord}
        savedWords={savedWords}
        onClose={closeWordDrawer}
        onAddWord={addWordToListAndCloseDrawer}
      />

      {/* Translation error toast */}
      {translationError && (
        <Toast
          message={translationError}
          onClose={clearTranslationError}
        />
      )}

      {/* Save word error toast */}
      {saveWordError && (
        <Toast
          message={saveWordError}
          onClose={clearSaveWordError}
        />
      )}

      {/* Translation hint tip for first-time users */}
      <TranslationHintTip visible={showHintTip} onDismiss={dismissHint} />
    </div>
  )
}
