import { act, renderHook, waitFor } from '@testing-library/react'

// Mock modules
const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
const mockT = jest.fn((key: string) => key)

let mockVocabularyState: { savedWords: any[] } = { savedWords: [] }
let mockStoryState = { id: '', text: '' }
let mockStoriesState: {
  isLoadingStory: boolean
  isLoadingQuestions: boolean
  error: string | null
  storyNotFound: boolean
  storyAlreadyRead: boolean
} = {
  isLoadingStory: false,
  isLoadingQuestions: false,
  error: null,
  storyNotFound: false,
  storyAlreadyRead: false,
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
import { useStoryById } from './useStoryById'

const mockUseNavigate = useNavigate as jest.Mock
const mockUseParams = useParams as jest.Mock

describe('useStoryById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseParams.mockReturnValue({ id: 'story-123' })
    mockVocabularyState = { savedWords: [] }
    mockStoryState = { id: '', text: '' }
    mockStoriesState = {
      isLoadingStory: false,
      isLoadingQuestions: false,
      error: null,
      storyNotFound: false,
      storyAlreadyRead: false,
    }
    mockSpeechSettings = {
      autoPlayEnabled: false,
      speechRate: 1,
    }
    mockT.mockImplementation((key: string) => key)
  })

  describe('story fetching', () => {
    it('should fetch story by ID on mount', async () => {
      mockDispatch.mockReturnValue({
        unwrap: () => Promise.resolve({
          story: {
            id: 'story-123',
            story: 'Test story content',
            translations: {},
          },
          hasBeenRead: false,
        }),
      })

      renderHook(() => useStoryById())

      // Should dispatch getStoryById action
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
      })
    })

    it('should not fetch if no ID is provided', async () => {
      mockUseParams.mockReturnValue({ id: undefined })

      renderHook(() => useStoryById())

      // Should not dispatch any action
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('story not found', () => {
    it('should expose storyNotFound state', () => {
      mockStoriesState = {
        ...mockStoriesState,
        storyNotFound: true,
      }

      const { result } = renderHook(() => useStoryById())

      expect(result.current.storyNotFound).toBe(true)
    })
  })

  describe('already read story', () => {
    it('should expose storyAlreadyRead state', () => {
      mockStoriesState = {
        ...mockStoriesState,
        storyAlreadyRead: true,
      }

      const { result } = renderHook(() => useStoryById())

      expect(result.current.storyAlreadyRead).toBe(true)
    })

    it('should not submit feedback when story is already read and handleComplete is called', async () => {
      mockStoriesState = {
        ...mockStoriesState,
        storyAlreadyRead: true,
      }
      mockStoryState = { id: 'story-123', text: 'Test story' }

      const { result } = renderHook(() => useStoryById())

      // Clear the dispatch calls from mount effect
      mockDispatch.mockClear()

      await act(async () => {
        await result.current.handleComplete()
      })

      // Should not dispatch any actions since story is already read
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should not submit feedback when story is already read and handleSkip is called', async () => {
      mockStoriesState = {
        ...mockStoriesState,
        storyAlreadyRead: true,
      }
      mockStoryState = { id: 'story-123', text: 'Test story' }

      const { result } = renderHook(() => useStoryById())

      // Clear the dispatch calls from mount effect
      mockDispatch.mockClear()

      await act(async () => {
        await result.current.handleSkip()
      })

      // Should not dispatch any actions since story is already read
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('navigation', () => {
    it('should navigate home on goHome call', () => {
      const { result } = renderHook(() => useStoryById())

      act(() => {
        result.current.goHome()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('should navigate home after completing a story that has not been read', async () => {
      mockStoriesState = {
        ...mockStoriesState,
        storyAlreadyRead: false,
      }
      mockStoryState = { id: 'story-123', text: 'Test story' }

      // Mock the dispatch calls
      mockDispatch.mockReturnValue({
        unwrap: () => Promise.resolve({}),
      })

      const { result } = renderHook(() => useStoryById())

      await act(async () => {
        await result.current.handleComplete()
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('loading states', () => {
    it('should expose isLoadingStory state', () => {
      mockStoriesState = {
        ...mockStoriesState,
        isLoadingStory: true,
      }

      const { result } = renderHook(() => useStoryById())

      expect(result.current.isLoadingStory).toBe(true)
    })

    it('should expose isLoadingQuestions state', () => {
      mockStoriesState = {
        ...mockStoriesState,
        isLoadingQuestions: true,
      }

      const { result } = renderHook(() => useStoryById())

      expect(result.current.isLoadingQuestions).toBe(true)
    })
  })

  describe('error states', () => {
    it('should expose storyError state', () => {
      mockStoriesState = {
        ...mockStoriesState,
        error: 'Failed to fetch story',
      }

      const { result } = renderHook(() => useStoryById())

      expect(result.current.storyError).toBe('Failed to fetch story')
    })
  })
})
