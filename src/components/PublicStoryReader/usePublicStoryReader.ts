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

  const handleWordClick = useCallback((_event: React.MouseEvent) => {
    setIsSignupModalOpen(true)
  }, [])

  const openSignupModal = useCallback(() => {
    setIsSignupModalOpen(true)
  }, [])

  const closeSignupModal = useCallback(() => {
    setIsSignupModalOpen(false)
  }, [])

  return {
    storyText,
    storyError,
    isFetchingStory,
    isSignupModalOpen,
    handleWordClick,
    openSignupModal,
    closeSignupModal,
  }
}
