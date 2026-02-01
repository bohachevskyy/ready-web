import { useRef, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import { VocabularyList } from "../VocabularyList"
import { QuizView } from "../QuizView"
import { StoryLoading } from "../StoryLoading"
import { Toast } from "../ui/toast"
import { useStoryById } from "./useStoryById"
import { StoryContent } from "../StoryReader/StoryContent"
import { WordPopover } from "../StoryReader/WordPopover"
import { WordDrawer } from "../StoryReader/WordDrawer"
import { VocabDrawer } from "../StoryReader/VocabDrawer"
import { StoryNotFound } from "./StoryNotFound"
import { AlreadyReadBanner } from "./AlreadyReadBanner"
import { useTranslation } from "../../i18n/useTranslation"

export function StoryById() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const {
    // State
    view,
    storyText,
    storyError,
    storyNotFound,
    storyAlreadyRead,
    savedWords,
    selectedWord,
    popoverPosition,
    questions,
    likeStatus,
    feedbackSubmitted,
    isLoadingStory,
    isLoadingQuestions,
    isVocabDrawerOpen,
    isWordDrawerOpen,
    translationError,
    popoverRef,

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
    goHome,
  } = useStoryById()

  // Scroll to top when transitioning to questions view
  useEffect(() => {
    if (view === 'questions' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [view])

  // Show full-screen loading animation while loading story
  if (isLoadingStory) {
    return <StoryLoading />
  }

  // Show not found page if story doesn't exist
  if (storyNotFound) {
    return <StoryNotFound onGoHome={goHome} />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div ref={scrollContainerRef} className="flex-1 flex flex-col p-8 overflow-auto">
        {/* Already read banner */}
        {storyAlreadyRead && <AlreadyReadBanner />}

        <h1 className="text-2xl font-semibold mb-8 text-foreground">
          {view === 'story' ? t('storyById.readingPractice') : t('storyById.quizTime')}
        </h1>
        <div className="max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl w-full mx-auto mb-12">
          <Card className="p-8 bg-card shadow-sm">
            {view === 'story' && (
              <StoryContent
                storyText={storyText}
                storyError={storyError}
                onWordClick={handleWordClick}
              />
            )}

            {view === 'questions' && (
              <QuizView
                questions={questions}
                isLoading={isLoadingQuestions}
                onComplete={handleComplete}
                onSkip={handleSkip}
                onLikeFeedback={handleLikeFeedback}
                onAttempt={handleAttempt}
                likeStatus={likeStatus}
                feedbackSubmitted={feedbackSubmitted}
                disableComplete={storyAlreadyRead}
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
                    {t('storyById.loadingQuestions')}
                  </>
                ) : (
                  t('storyById.finish')
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
      <div className="hidden lg:block w-80 border-l border-border">
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
    </div>
  )
}
