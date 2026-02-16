import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { fetchPublicStoryById } from "../../store/storiesSlice"
import { setStoryId, setStoryText, setTranslations } from "../../store/storySlice"
import { useAppDispatch, useAppSelector } from "../../store/store"
import { useTranslation } from "../../i18n/useTranslation"

export function usePublicStoryReader() {
  const { param } = useParams<{ param?: string }>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const storyText = useAppSelector((state) => state.story.text)
  const isFetchingStory = useAppSelector((state) => state.stories.isFetchingStory)
  const storyError = useAppSelector((state) => state.stories.error)

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isWordDrawerOpen, setIsWordDrawerOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const hasFetchedStory = useRef(false)

  // Fetch story on mount (no auth)
  useEffect(() => {
    if (hasFetchedStory.current || !param) return

    const loadStory = async () => {
      hasFetchedStory.current = true

      try {
        const result = await dispatch(fetchPublicStoryById(param)).unwrap()
        dispatch(setStoryId(result.id))
        dispatch(setStoryText(result.story))
        dispatch(setTranslations(result.translations))
      } catch (err) {
        console.error('Failed to load public story:', err)
        if (err instanceof Error && err.message === 'Story not found') {
          dispatch(setStoryText(t('storyReader.storyNotFound')))
        } else {
          dispatch(setStoryText("Failed to load story. Please try again later."))
        }
      }
    }

    loadStory()
  }, [dispatch, param, t])

  const handleWordClick = useCallback((event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const word = target.textContent?.trim() || null
    if (word) {
      setSelectedWord(word)
      setIsWordDrawerOpen(true)
    }
  }, [])

  const openSignupModal = useCallback(() => {
    setIsSignupModalOpen(true)
  }, [])

  const closeSignupModal = useCallback(() => {
    setIsSignupModalOpen(false)
  }, [])

  const closeWordDrawer = useCallback(() => {
    setIsWordDrawerOpen(false)
    setSelectedWord(null)
  }, [])

  const handleSignupFromDrawer = useCallback(() => {
    setIsWordDrawerOpen(false)
    setIsSignupModalOpen(true)
  }, [])

  return {
    storyText,
    storyError,
    isFetchingStory,
    isSignupModalOpen,
    isWordDrawerOpen,
    selectedWord,
    handleWordClick,
    openSignupModal,
    closeSignupModal,
    closeWordDrawer,
    handleSignupFromDrawer,
  }
}
