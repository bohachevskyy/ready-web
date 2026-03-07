import { useRef, useEffect, useState, useCallback } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Loader2, icons } from "lucide-react"
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
import { usePageTitle } from "../../contexts/PageTitleContext"
import { useOnboarding, OnboardingStep } from "../../hooks/useOnboarding"
import { OnboardingTooltip } from "../onboarding/OnboardingTooltip"
  export function StoryReader() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isBannerDismissed, setIsBannerDismissed] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const { t } = useTranslation()
  const onboarding = useOnboarding()

  const {
    // State
    view,
    storyText,
    storyTitle,
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

  const { setPageTitle } = usePageTitle()

  // Set page/document title to story title
  useEffect(() => {
    if (storyTitle) {
      setPageTitle(storyTitle)
    }
    return () => setPageTitle('')
  }, [storyTitle, setPageTitle])

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

  // Onboarding step 2: Click a word
  const isClickWordStep = onboarding.isStepActive(OnboardingStep.CLICK_WORD)

  // Onboarding step 5: After vocabulary viewed, guide user to finish story
  const isAfterVocabularyStep = onboarding.isActive && onboarding.currentStep === OnboardingStep.PRACTICE_WORDS && view === 'story'

  // Advance from step 2 (CLICK_WORD) to step 3 (ADD_WORD) when word details appear
  useEffect(() => {
    if (isClickWordStep && (isWordDrawerOpen || selectedWord)) {
      onboarding.completeCurrentStep()
    }
  }, [isClickWordStep, isWordDrawerOpen, selectedWord, onboarding])

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
        onboarding={onboarding}
      />

      {/* Desktop Vocabulary Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-80 bg-sidebar/50 border-l border-border/40">
        <VocabularyList savedWords={savedWords} onRemoveWord={handleRemoveWord} onboarding={onboarding} />
      </div>

      {/* Mobile Vocabulary FAB + Drawer */}
      <VocabDrawer
        isOpen={isVocabDrawerOpen}
        savedWords={savedWords}
        onOpen={openVocabDrawer}
        onClose={closeVocabDrawer}
        onRemoveWord={handleRemoveWord}
        onboarding={onboarding}
      />

      {/* Mobile Word Details Drawer */}
      <WordDrawer
        isOpen={isWordDrawerOpen}
        selectedWord={selectedWord}
        savedWords={savedWords}
        onClose={closeWordDrawer}
        onAddWord={addWordToListAndCloseDrawer}
        onboarding={onboarding}
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

      {/* Onboarding tooltip for step 2: Click a word */}
      {isClickWordStep && (
        <OnboardingTooltip
          step={OnboardingStep.CLICK_WORD}
          visible={isClickWordStep}
          onNext={onboarding.completeCurrentStep}
          onSkip={onboarding.skipOnboarding}
        />
      )}

      {/* Onboarding tooltip after vocabulary: Guide to finish story */}
      {isAfterVocabularyStep && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md w-[calc(100%-2rem)]">
          <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-2xl border-2 border-primary-foreground/20">
            <div className="flex items-start gap-3 mb-3">
              <icons.BookCheck className="h-5 w-5 mt-0.5 flex-shrink-0 opacity-90" />
              <div className="flex-1">
                <h3 className="text-base font-semibold leading-snug">{t('onboarding.finishStory.title')}</h3>
              </div>
              <button
                onClick={onboarding.skipOnboarding}
                className="flex-shrink-0 p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="Close"
              >
                <icons.X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-95 mb-4 ml-8">
              {t('onboarding.finishStory.message')}
            </p>
            <div className="flex items-center justify-between gap-4 ml-8">
              <span className="text-xs opacity-75 font-medium">{t('onboarding.progress', { current: '5', total: '5' })}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onboarding.skipOnboarding}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-primary-foreground/20 transition-colors"
                >
                  {t('onboarding.skip')}
                </button>
                <button
                  onClick={onboarding.completeCurrentStep}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-foreground/90 text-primary hover:bg-primary-foreground transition-colors shadow-sm"
                >
                  {t('onboarding.gotIt')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
