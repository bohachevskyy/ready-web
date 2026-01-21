import { act, renderHook, waitFor } from '@testing-library/react'

// Mock modules
const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
const mockT = jest.fn((key: string) => key)

let mockVocabularyState: { savedWords: any[] } = { savedWords: [] }
let mockStoryState = { id: 'story-123', text: 'Test story' }
let mockStoriesState = {
  isGeneratingStory: false,
  isLoadingQuestions: false,
  error: null,
}
let mockSpeechSettings = {
  autoPlayEnabled: false,
  speechRate: 1,
}

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}))

jest.mock('../../store/store', () => ({
  useAppSelector: (selector: (state: any) => any) =>
    selector({
      vocabulary: mockVocabularyState,
      story: mockStoryState,
      stories: mockStoriesState,
      speechSettings: mockSpeechSettings,
    }),
  useAppDispatch: () => mockDispatch,
}))

jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({ t: mockT }),
}))

jest.mock('../../hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: () => ({ speak: jest.fn(), supported: true }),
}))

// Import modules after mocks
import { useNavigate, useParams } from 'react-router-dom'
import { useStoryReader } from './useStoryReader'

const mockUseNavigate = useNavigate as jest.Mock
const mockUseParams = useParams as jest.Mock

describe('useStoryReader - Question Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseParams.mockReturnValue({ domain: 'test-domain' })
    mockVocabularyState = { savedWords: [] }
    mockStoryState = { id: 'story-123', text: 'Test story' }
    mockStoriesState = {
      isGeneratingStory: false,
      isLoadingQuestions: false,
      error: null,
    }
    mockSpeechSettings = {
      autoPlayEnabled: false,
      speechRate: 1,
    }
    mockT.mockImplementation((key: string) => key)

    // Mock generateStory on mount to succeed
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.resolve({
        id: 'story-123',
        story: 'Test story',
        translations: {},
      }),
    })
  })

  describe('handleFinish', () => {
    it('should set questionError when getQuestions fails', async () => {
      // First call is generateStory on mount (success)
      mockDispatch.mockReturnValueOnce({
        unwrap: () => Promise.resolve({
          id: 'story-123',
          story: 'Test story',
          translations: {},
        }),
      })

      // Second call is getQuestions (failure)
      mockDispatch.mockReturnValueOnce({
        unwrap: () => Promise.reject(new Error('Failed to fetch questions')),
      })

      const { result } = renderHook(() => useStoryReader())

      // Initially no error
      expect(result.current.questionError).toBeNull()

      // Call handleFinish
      await act(async () => {
        await result.current.handleFinish()
      })

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.questionError).toBe('storyReader.questionsError')
      })

      // Verify translation key was requested
      expect(mockT).toHaveBeenCalledWith('storyReader.questionsError')
    })
  })

  describe('handleSkipQuestions', () => {
    it('should navigate home even if feedback submission fails', async () => {
      // First call is generateStory on mount
      mockDispatch.mockReturnValueOnce({
        unwrap: () => Promise.resolve({
          id: 'story-123',
          story: 'Test story',
          translations: {},
        }),
      })

      // Second call is submitFeedback (failure)
      mockDispatch.mockReturnValueOnce({
        unwrap: () => Promise.reject(new Error('Failed to submit feedback')),
      })

      mockVocabularyState = { savedWords: [] }

      const { result } = renderHook(() => useStoryReader())

      await act(async () => {
        await result.current.handleSkipQuestions()
      })

      // Should still navigate home despite error
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should save words and navigate home when skipping with saved words', async () => {
      const mockSavedWords = [
        {
          id: '1',
          word: 'test',
          translation: 'prueba',
          timestamp: Date.now(),
          example_sentence: 'This is a test',
          grammatical_info: 'noun',
          sentence_translation: 'Esta es una prueba',
        },
      ]

      mockVocabularyState = { savedWords: mockSavedWords }

      // First call is generateStory on mount
      mockDispatch.mockReturnValueOnce({
        unwrap: () => Promise.resolve({
          id: 'story-123',
          story: 'Test story',
          translations: {},
        }),
      })

      // Second call is saveWords
      mockDispatch.mockReturnValueOnce({
        unwrap: () => Promise.resolve({ success: true }),
      })

      // Third call is submitFeedback
      mockDispatch.mockReturnValueOnce({
        unwrap: () => Promise.resolve({ success: true }),
      })

      // Fourth call is clearAllWords
      mockDispatch.mockReturnValueOnce({ type: 'vocabulary/clearAllWords' })

      const { result } = renderHook(() => useStoryReader())

      await act(async () => {
        await result.current.handleSkipQuestions()
      })

      // Verify navigation to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })
})
