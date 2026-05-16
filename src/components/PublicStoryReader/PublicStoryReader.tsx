import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { StoryLoading } from "../StoryLoading"
import { SignupModal } from "../SignupModal"
import { PublicWordDrawer } from "./PublicWordDrawer"
import { StoryContent } from "../StoryReader/StoryContent"
import { ReadingProgress } from "../ReadingProgress"
import { DuoButton } from "../ui/duo-button"
import { usePublicStoryReader } from "./usePublicStoryReader"
import { useTranslation } from "../../i18n/useTranslation"

function extractTitle(text: string): string {
  if (!text) return ''
  const match = text.match(/^(.+?[.!?])\s/)
  if (match && match[1].length <= 160) {
    return match[1]
  }
  const firstLine = text.split('\n')[0] || ''
  const breakMatch = firstLine.slice(0, 100).match(/^(.{30,}?)[,;—–]\s/)
  if (breakMatch) {
    return breakMatch[1] + '...'
  }
  if (firstLine.length <= 100) return firstLine
  const truncated = firstLine.slice(0, 90)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

export function PublicStoryReader() {
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const { t } = useTranslation()

  const {
    storyText,
    storyError,
    isFetchingStory,
    isSignupModalOpen,
    isWordDrawerOpen,
    selectedWord,
    handleWordClick,
    closeSignupModal,
    closeWordDrawer,
    handleSignupFromDrawer,
  } = usePublicStoryReader()

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

  const storyTitle = useMemo(() => extractTitle(storyText), [storyText])

  if (isFetchingStory) {
    return <StoryLoading />
  }

  // Show unauthorized page if story failed to load
  if (storyError) {
    return (
      <div className="flex h-screen bg-cream items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="font-black text-[28px] text-ink tracking-tight m-0">
              {t('publicStory.signupRequired')}
            </h1>
            <p className="text-ink-mute">
              {t('publicStory.signupRequiredDescription')}
            </p>
          </div>
          <DuoButton
            onClick={() => navigate('/login')}
            size="lg"
            block
          >
            {t('publicStory.signupToRead')}
          </DuoButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-cream">
      <div ref={scrollContainerRef} className="flex-1 flex flex-col overflow-auto relative scroll-cream">
        <ReadingProgress progress={scrollProgress} />

        <div className="max-w-[700px] w-full mx-auto px-6 sm:px-8 pt-10 pb-16">
          {storyTitle && (
            <header className="mb-7">
              <h1 className="font-serif text-[42px] font-bold leading-[1.05] text-ink tracking-tight m-0">
                {storyTitle}
              </h1>
            </header>
          )}

          <StoryContent
            storyText={storyText}
            storyError={storyError}
            onWordClick={handleWordClick}
          />

          {!storyError && storyText && (
            <div className="mt-12 mb-8 text-center">
              <p className="text-ink-mute text-sm font-semibold">
                {t('publicStory.clickWordToSignup')}
              </p>
            </div>
          )}
        </div>
      </div>

      <PublicWordDrawer
        isOpen={isWordDrawerOpen}
        selectedWord={selectedWord}
        onClose={closeWordDrawer}
        onSignup={handleSignupFromDrawer}
      />

      <SignupModal
        open={isSignupModalOpen}
        onClose={closeSignupModal}
        onComplete={closeSignupModal}
      />
    </div>
  )
}
