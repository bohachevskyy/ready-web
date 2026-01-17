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

export function StoryReader() {
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
  } = useStoryReader()

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
