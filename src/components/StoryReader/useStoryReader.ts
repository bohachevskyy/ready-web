import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { addWord, removeWord, clearAllWords } from "../../store/vocabularySlice"
import { setStoryId, setStoryText, setTranslations } from "../../store/storySlice"
import { generateStory, getQuestions, submitFeedback, getWordDetails, saveWords, type Question, type WordDetailsResponse } from "../../store/storiesSlice"
import { useAppDispatch, useAppSelector } from "../../store/store"
import type { SavedWord } from "../../types"
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis"
import { useTranslation } from "../../i18n/useTranslation"
import type { PopoverPosition } from "./types"

export function useStoryReader() {
  const { domain } = useParams<{ domain: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const savedWords = useAppSelector((state) => state.vocabulary.savedWords)
  const storyId = useAppSelector((state) => state.story.id)
  const storyText = useAppSelector((state) => state.story.text)

  // Redux Thunk selectors
  const isGeneratingStory = useAppSelector((state) => state.stories.isGeneratingStory)
  const isLoadingQuestions = useAppSelector((state) => state.stories.isLoadingQuestions)
  const storyError = useAppSelector((state) => state.stories.error)

  // Speech synthesis for word pronunciation
  const { speak, supported: speechSupported } = useSpeechSynthesis()
  const { autoPlayEnabled, speechRate } = useAppSelector((state) => state.speechSettings)

  const [selectedWord, setSelectedWord] = useState<WordDetailsResponse | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null)

  // Track if story has been fetched to prevent duplicate requests
  const hasFetchedStory = useRef(false)

  // Ref for the popover element to detect outside clicks
  const popoverRef = useRef<HTMLDivElement>(null)

  // Questions state
  const [view, setView] = useState<'story' | 'questions'>('story')
  const [questions, setQuestions] = useState<Question[]>([])
  const [attemptCounts] = useState<Record<string, number>>({})
  const [feedbackSubmitted] = useState(false)
  const [likeStatus, setLikeStatus] = useState<"like" | "dislike" | null>(null)
  const [isVocabDrawerOpen, setIsVocabDrawerOpen] = useState<boolean>(false)
  const [isWordDrawerOpen, setIsWordDrawerOpen] = useState<boolean>(false)
  const [translationError, setTranslationError] = useState<string | null>(null)
  const clickedWordRef = useRef<HTMLElement | null>(null)

  // Fetch story on component mount
  useEffect(() => {
    if (hasFetchedStory.current) return

    const fetchStory = async () => {
      hasFetchedStory.current = true
      try {
        const result = await dispatch(generateStory({
          level: 1,
          age_bracket: '8-10',
          domain: domain
        })).unwrap()

        dispatch(setStoryId(result.id))
        dispatch(setStoryText(result.story))
        dispatch(setTranslations(result.translations))
      } catch (err) {
        console.error('Failed to fetch story:', err)
        // Fallback to sample text if API fails
        dispatch(setStoryText("Failed to load story. Please try again later."))
      }
    }

    fetchStory()
  }, [dispatch, domain])

  // Auto-play pronunciation when word popup is shown
  useEffect(() => {
    if (autoPlayEnabled && speechSupported && selectedWord) {
      // Longer delay for mobile to account for drawer animation + scroll
      const delay = isWordDrawerOpen ? 500 : 300
      const timer = setTimeout(() => {
        speak(selectedWord.expression, { rate: speechRate })
      }, delay)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [selectedWord, autoPlayEnabled, speechSupported, speak, speechRate, isWordDrawerOpen])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        // Check if the click is on a word (which should open a new popover, not close the current one)
        const target = event.target as HTMLElement
        const isWordClick = target.closest('[data-start][data-end]') !== null

        // Only close if it's not a word click
        if (!isWordClick) {
          setSelectedWord(null)
          setPopoverPosition(null)
        }
      }
    }

    if (popoverPosition) {
      // Add event listener with a small delay to prevent immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [popoverPosition])

  const handleFinish = useCallback(async () => {
    if (!storyId) return

    try {
      const result = await dispatch(getQuestions(storyId)).unwrap()
      setQuestions(result.questions)
      setView('questions')
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    }
  }, [dispatch, storyId])

  const handleComplete = useCallback(async () => {
    if (!storyId) return

    try {
      // Save words to vocabulary if any were added
      if (savedWords.length > 0) {
        await dispatch(saveWords({
          words: savedWords.map(word => ({
            word: word.word,
            translation: word.translation,
            sentence_context: word.example_sentence,
            sentence_example: word.example_sentence,
            story_id: storyId
          }))
        })).unwrap()
      }

      await dispatch(submitFeedback({
        storyId,
        feedback: {
          start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          is_skipped: false,
          question_attempts: questions.map(q => attemptCounts[q.id] || 0),
          is_liked: likeStatus === "like",
          is_disliked: likeStatus === "dislike",
          feedback_text: likeStatus === "like" ? "Story liked" : likeStatus === "dislike" ? "Story disliked" : "Story completed"
        }
      })).unwrap()

      // Clear vocabulary list after successful submission
      dispatch(clearAllWords())

      // Redirect to main page
      navigate('/')
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      // Still redirect even if feedback fails
      navigate('/')
    }
  }, [dispatch, storyId, savedWords, questions, attemptCounts, likeStatus, navigate])

  const handleLikeFeedback = useCallback((status: "like" | "dislike") => {
    // Toggle status
    const newStatus = likeStatus === status ? null : status
    setLikeStatus(newStatus)
  }, [likeStatus])

  const handleSkip = useCallback(async () => {
    if (!storyId) return

    try {
      // Save words to vocabulary if any were added
      if (savedWords.length > 0) {
        await dispatch(saveWords({
          words: savedWords.map(word => ({
            word: word.word,
            translation: word.translation,
            sentence_context: word.example_sentence,
            sentence_example: word.example_sentence,
            story_id: storyId
          }))
        })).unwrap()
      }

      await dispatch(submitFeedback({
        storyId,
        feedback: {
          start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          is_skipped: true,
          question_attempts: questions.map(q => attemptCounts[q.id] || 0),
          is_liked: likeStatus === "like",
          is_disliked: likeStatus === "dislike",
          feedback_text: "Story skipped"
        }
      })).unwrap()

      // Clear vocabulary list after successful submission
      dispatch(clearAllWords())

      // Redirect to main page
      navigate('/')
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      // Still redirect even if feedback fails
      navigate('/')
    }
  }, [dispatch, storyId, savedWords, questions, attemptCounts, likeStatus, navigate])

  const scrollWordIntoView = useCallback((wordElement: HTMLElement) => {
    // Wait for drawer animation to start
    setTimeout(() => {
      const rect = wordElement.getBoundingClientRect()
      const drawerHeight = window.innerHeight * 0.7 // 70vh
      const visibleAreaBottom = window.innerHeight - drawerHeight
      const padding = 20 // Extra padding from drawer top

      // Check if word is below the visible area (would be covered by drawer)
      if (rect.bottom > visibleAreaBottom - padding) {
        // Scroll word to safe position (1/3 from top of viewport)
        const targetY = window.innerHeight / 3
        const scrollAmount = rect.top - targetY

        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        })
      }
      // If word is already visible above drawer, don't scroll
    }, 100)
  }, [])

  const handleWordClick = useCallback(async (event: React.MouseEvent) => {
    if (!storyId) return

    const target = event.target as HTMLElement
    const start = target.getAttribute('data-start')
    const end = target.getAttribute('data-end')

    if (!start || !end) return

    // Store reference to clicked word for scroll positioning
    clickedWordRef.current = target

    // Detect if mobile or desktop
    const isMobile = window.innerWidth < 1024

    if (isMobile) {
      // Mobile: Open bottom drawer
      setIsWordDrawerOpen(true)
      setSelectedWord(null) // Show loading state

      try {
        const result = await dispatch(getWordDetails({
          storyId,
          start: parseInt(start),
          end: parseInt(end),
        })).unwrap()

        setSelectedWord(result)

        // Smart scroll to keep word visible
        scrollWordIntoView(target)
      } catch (error) {
        console.error('Failed to fetch word details:', error)
        // Close drawer and show error toast
        setIsWordDrawerOpen(false)
        setTranslationError(t('storyReader.translationError'))
      }
    } else {
      // Desktop: Keep existing popover logic
      const rect = target.getBoundingClientRect()
      const popoverHeight = 400
      const popoverWidth = 400
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom

      const showBelow = spaceBelow > popoverHeight || spaceBelow > spaceAbove

      const wordCenterX = rect.left + rect.width / 2
      const halfPopoverWidth = popoverWidth / 2
      const padding = 16

      let horizontalAlign: 'left' | 'center' | 'right' = 'center'
      let x = wordCenterX

      if (wordCenterX - halfPopoverWidth < padding) {
        horizontalAlign = 'left'
        x = padding + halfPopoverWidth
      } else if (wordCenterX + halfPopoverWidth > window.innerWidth - padding) {
        horizontalAlign = 'right'
        x = window.innerWidth - padding - halfPopoverWidth
      }

      setPopoverPosition({
        x: x,
        y: showBelow ? rect.bottom + 4 : rect.top - 4,
        showBelow: showBelow,
        horizontalAlign: horizontalAlign,
      })

      setSelectedWord(null)

      try {
        const result = await dispatch(getWordDetails({
          storyId,
          start: parseInt(start),
          end: parseInt(end),
        })).unwrap()

        setSelectedWord(result)
      } catch (error) {
        console.error('Failed to fetch word details:', error)
        setPopoverPosition(null)
        setTranslationError(t('storyReader.translationError'))
      }
    }
  }, [dispatch, storyId, scrollWordIntoView, t])

  const addWordToList = useCallback(() => {
    if (!selectedWord) return

    // Add to Redux vocabulary store
    const newWord: SavedWord = {
      id: `${Date.now()}-${selectedWord.expression}`,
      word: selectedWord.expression,
      translation: selectedWord.translation,
      timestamp: Date.now(),
      grammatical_info: selectedWord.grammatical_info,
      sentence_translation: selectedWord.sentence_translation,
      example_sentence: selectedWord.example_sentence,
    }
    dispatch(addWord(newWord))

    // Hide popover after adding word
    setSelectedWord(null)
    setPopoverPosition(null)
  }, [dispatch, selectedWord])

  const addWordToListAndCloseDrawer = useCallback(() => {
    if (!selectedWord) return

    const newWord: SavedWord = {
      id: `${Date.now()}-${selectedWord.expression}`,
      word: selectedWord.expression,
      translation: selectedWord.translation,
      timestamp: Date.now(),
      grammatical_info: selectedWord.grammatical_info,
      sentence_translation: selectedWord.sentence_translation,
      example_sentence: selectedWord.example_sentence,
    }
    dispatch(addWord(newWord))
    setIsWordDrawerOpen(false)
    setSelectedWord(null)
    clickedWordRef.current = null
  }, [dispatch, selectedWord])

  const handleRemoveWord = useCallback((id: string) => {
    dispatch(removeWord(id))
  }, [dispatch])

  const closePopover = useCallback(() => {
    setSelectedWord(null)
    setPopoverPosition(null)
  }, [])

  const closeWordDrawer = useCallback(() => {
    setIsWordDrawerOpen(false)
    setSelectedWord(null)
    clickedWordRef.current = null
  }, [])

  const openVocabDrawer = useCallback(() => {
    setIsVocabDrawerOpen(true)
  }, [])

  const closeVocabDrawer = useCallback(() => {
    setIsVocabDrawerOpen(false)
  }, [])

  const clearTranslationError = useCallback(() => {
    setTranslationError(null)
  }, [])

  return {
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
    handleRemoveWord,
    addWordToList,
    addWordToListAndCloseDrawer,
    closePopover,
    closeWordDrawer,
    openVocabDrawer,
    closeVocabDrawer,
    clearTranslationError,
  }
}
