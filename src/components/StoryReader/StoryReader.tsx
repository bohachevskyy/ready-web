import { useRef, useEffect, useState } from "react"
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

export function StoryReader() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isBannerDismissed, setIsBannerDismissed] = useState(false)

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

  // Scroll to top when transitioning to questions view
  useEffect(() => {
    if (view === 'questions' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [view])

  // Determine if story is completed
  const isCompleted = readerStatus?.status === 'completed' || !!readerStatus?.completed_at
  const showCompletionBanner = isCompleted && !isBannerDismissed && view === 'story'

  // Show full-screen loading animation while generating or fetching story
  if (isGeneratingStory || isFetchingStory) {
    return <StoryLoading />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main reading area */}
      <div ref={scrollContainerRef} className="flex-1 flex flex-col p-8 overflow-auto">
        <div className="max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl w-full mx-auto mb-12">
          <h1 className="text-2xl font-semibold mb-8 text-foreground">
            {view === 'story' ? 'Reading Practice' : 'Quiz Time'}
          </h1>
          {showCompletionBanner && (
            <CompletionBanner
              completedAt={readerStatus?.completed_at || null}
              onDismiss={() => setIsBannerDismissed(true)}
            />
          )}
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
              />
            )}
          </Card>

          {view === 'story' && !storyError && !isCompleted && (
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

      {/* Save word error toast */}
      {saveWordError && (
        <Toast
          message={saveWordError}
          onClose={clearSaveWordError}
        />
      )}
    </div>
  )
}
