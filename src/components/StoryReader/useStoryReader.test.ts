import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'

// Mock modules
const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
const mockT = jest.fn((key: string) => key)

let mockVocabularyState: { savedWords: any[] } = { savedWords: [] }
let mockStoryState = { id: 'story-123', text: 'Test story', title: '', translations: {}, domain: 'history' }
let mockStoriesState = {
  isGeneratingStory: false,
  isFetchingStory: false,
  isSubmittingFeedback: false,
  error: null,
  readerStatus: null,
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

const mockSaveWords = jest.fn()
jest.mock('../../store/storiesSlice', () => {
  const actual = jest.requireActual('../../store/storiesSlice')
  return {
    ...actual,
    saveWords: (req: unknown) => {
      mockSaveWords(req)
      const p = Promise.resolve() as Promise<void> & { unwrap: () => Promise<void> }
      p.unwrap = () => p
      return () => p
    },
  }
})

// Import modules after mocks
import { useNavigate, useParams } from 'react-router-dom'
import { useStoryReader } from './useStoryReader'

const mockUseNavigate = useNavigate as jest.Mock
const mockUseParams = useParams as jest.Mock

describe('useStoryReader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSaveWords.mockClear()
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseParams.mockReturnValue({ param: 'test-domain' })
    mockVocabularyState = { savedWords: [] }
    mockStoryState = { id: 'story-123', text: 'Test story', title: '', translations: {}, domain: 'history' }
    mockStoriesState = {
      isGeneratingStory: false,
      isFetchingStory: false,
      isSubmittingFeedback: false,
      error: null,
      readerStatus: null,
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

  describe('handleComplete', () => {
    it('should transition to completion view without submitting feedback', async () => {
      const { result } = renderHook(() => useStoryReader())

      act(() => {
        result.current.handleComplete()
      })

      expect(result.current.view).toBe('completion')
      // Should not navigate or submit feedback
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('handleSkip', () => {
    it('should submit skip feedback and navigate to next story from same domain', async () => {
      const defaultRet = { unwrap: () => Promise.resolve() }
      mockDispatch.mockReturnValue(defaultRet)

      const { result } = renderHook(() => useStoryReader())

      await act(async () => {
        await result.current.handleSkip()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/story/history', { replace: true })
    })
  })

  describe('handleNextStory', () => {
    it('should submit feedback and navigate to next story from same domain', async () => {
      const defaultRet = { unwrap: () => Promise.resolve() }
      mockDispatch.mockReturnValue(defaultRet)

      const { result } = renderHook(() => useStoryReader())

      await act(async () => {
        await result.current.handleNextStory()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/story/history', { replace: true })
    })
  })

  describe('handleSeeMoreCategories', () => {
    it('should submit feedback and navigate to category selection', async () => {
      const defaultRet = { unwrap: () => Promise.resolve() }
      mockDispatch.mockReturnValue(defaultRet)

      const { result } = renderHook(() => useStoryReader())

      await act(async () => {
        await result.current.handleSeeMoreCategories()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/story/category')
    })
  })

  describe('handleLikeFeedback', () => {
    it('should toggle like status', () => {
      const { result } = renderHook(() => useStoryReader())

      act(() => {
        result.current.handleLikeFeedback('like')
      })
      expect(result.current.likeStatus).toBe('like')

      act(() => {
        result.current.handleLikeFeedback('like')
      })
      expect(result.current.likeStatus).toBe(null)

      act(() => {
        result.current.handleLikeFeedback('dislike')
      })
      expect(result.current.likeStatus).toBe('dislike')
    })
  })

  describe('wordCount', () => {
    it('should reflect saved words count', () => {
      mockVocabularyState = { savedWords: [{ id: '1' }, { id: '2' }] as any[] }
      const { result } = renderHook(() => useStoryReader())
      expect(result.current.wordCount).toBe(2)
    })
  })

  describe('save-on-add', () => {
    it('addWordToList dispatches addWord and saveWords with story_id', async () => {
      const word = {
        expression: 'hello',
        translation: 'hola',
        grammatical_info: 'interj',
        sentence_translation: 'Hi there.',
        example_sentence: 'Hello, world!',
      }
      let thunkCount = 0
      mockDispatch.mockImplementation((action: unknown) => {
        if (typeof action === 'function') {
          const ix = thunkCount++
          const thunk = action as () => Promise<unknown>
          if (ix === 0) return { unwrap: () => Promise.resolve({ id: 'story-123', story: 'Test story', translations: {} }) }
          if (ix === 1) return { unwrap: () => Promise.resolve({ expression: word.expression, translation: word.translation, grammatical_info: word.grammatical_info, sentence_translation: word.sentence_translation, example_sentence: word.example_sentence }) }
          return thunk()
        }
        if (typeof action === 'object' && action !== null && 'type' in action) {
          const a = action as { type: string }
          if (a.type === 'vocabulary/addWord') {
            const payload = (action as unknown as { payload: unknown }).payload
            mockVocabularyState.savedWords = [...mockVocabularyState.savedWords, payload as any]
          }
        }
        return { unwrap: () => Promise.resolve() }
      })

      const { result } = renderHook(() => useStoryReader())

      const el = document.createElement('span')
      el.setAttribute('data-start', '0')
      el.setAttribute('data-end', '5')
      el.getBoundingClientRect = () => ({ top: 100, bottom: 120, left: 50, right: 100, width: 50, height: 20, x: 50, y: 100, toJSON: () => {} })

      await act(async () => {
        await result.current.handleWordClick({ target: el } as unknown as React.MouseEvent)
      })

      await act(() => {
        result.current.addWordToList()
      })

      expect(mockSaveWords).toHaveBeenCalledWith({
        words: [{
          word: word.expression,
          translation: word.translation,
          sentence_context: word.example_sentence,
          sentence_example: word.example_sentence,
          story_id: 'story-123',
        }],
      })
      const addWordCalls = mockDispatch.mock.calls.filter(
        (c) => typeof c[0] === 'object' && c[0] !== null && 'type' in c[0] && (c[0] as { type: string }).type === 'vocabulary/addWord'
      )
      expect(addWordCalls.length).toBeGreaterThanOrEqual(1)
      expect(addWordCalls[0][0]).toMatchObject({ type: 'vocabulary/addWord', payload: expect.objectContaining({ word: word.expression, translation: word.translation }) })
    })

    it('handleComplete does not call saveWords', async () => {
      const defaultRet = { unwrap: () => Promise.resolve() }
      mockDispatch.mockReturnValue(defaultRet)

      const { result } = renderHook(() => useStoryReader())

      act(() => {
        result.current.handleComplete()
      })

      expect(mockSaveWords).not.toHaveBeenCalled()
    })
  })
})
