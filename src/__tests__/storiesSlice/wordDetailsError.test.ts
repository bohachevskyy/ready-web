import { configureStore } from '@reduxjs/toolkit'
import storiesReducer, {
  getWordDetails,
  clearWordDetailsError,
  clearStory,
} from '../../store/storiesSlice'
import authReducer from '../../store/authSlice'
import { fetchWithAuth } from '../../utils/fetchWithAuth'

jest.mock('../../utils/fetchWithAuth')
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

/**
 * Helper to create a test store with stories slice
 */
const createTestStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      stories: storiesReducer,
      auth: authReducer,
    },
    preloadedState: {
      stories: {
        currentStory: null,
        questions: [],
        wordDetails: null,
        isGeneratingStory: false,
        isLoadingQuestions: false,
        isLoadingWordDetails: false,
        isSavingWords: false,
        isSubmittingFeedback: false,
        error: null,
        wordDetailsError: null,
        ...initialState.stories,
      },
      auth: {
        token: 'test-token',
        tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        refreshToken: 'test-refresh-token',
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        user: null,
        isLoading: false,
        error: null,
        networkError: false,
        uiLanguage: null,
        ...initialState.auth,
      },
    },
  })
}

/**
 * Helper to create a successful Response mock
 */
const createSuccessResponse = (data: any): Response => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
} as Response)

/**
 * Helper to create an error Response mock
 */
const createErrorResponse = (status: number = 500): Response => ({
  ok: false,
  status,
  statusText: status === 500 ? 'Internal Server Error' : 'Error',
  json: async () => ({}),
  text: async () => '{}',
  headers: new Headers(),
} as Response)

describe('storiesSlice - Word Details Error Handling', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
  })

  describe('getWordDetails', () => {
    const mockWordDetails = {
      expression: 'test',
      translation: 'тест',
      grammatical_info: 'noun',
      sentence_translation: 'This is a test sentence',
      example_sentence: 'This is an example',
    }

    it('should set isLoadingWordDetails to true and clear wordDetailsError on pending', async () => {
      // Setup a never-resolving promise to catch the pending state
      mockFetchWithAuth.mockImplementation(() => new Promise(() => {}))

      store.dispatch(getWordDetails({ storyId: 'story-1', start: 0, end: 4 }))

      const state = store.getState().stories
      expect(state.isLoadingWordDetails).toBe(true)
      expect(state.wordDetailsError).toBeNull()
    })

    it('should set wordDetails and clear loading on success', async () => {
      mockFetchWithAuth.mockResolvedValue(createSuccessResponse(mockWordDetails))

      await store.dispatch(getWordDetails({ storyId: 'story-1', start: 0, end: 4 }))

      const state = store.getState().stories
      expect(state.isLoadingWordDetails).toBe(false)
      expect(state.wordDetails).toEqual(mockWordDetails)
      expect(state.wordDetailsError).toBeNull()
    })

    it('should set wordDetailsError on failure without affecting main error', async () => {
      mockFetchWithAuth.mockResolvedValue(createErrorResponse(500))

      await store.dispatch(getWordDetails({ storyId: 'story-1', start: 0, end: 4 }))

      const state = store.getState().stories
      expect(state.isLoadingWordDetails).toBe(false)
      expect(state.wordDetailsError).toBe('Failed to get word details')
      // Main error should remain null
      expect(state.error).toBeNull()
    })

    it('should not hide story when word details fails (error states are separate)', async () => {
      // First, simulate a successful story generation
      store = createTestStore({
        stories: {
          currentStory: { id: 'story-1', story: 'Test story content', translations: {} },
          error: null,
        },
      })

      mockFetchWithAuth.mockResolvedValue(createErrorResponse(500))

      await store.dispatch(getWordDetails({ storyId: 'story-1', start: 0, end: 4 }))

      const state = store.getState().stories
      // Story should still be present
      expect(state.currentStory).not.toBeNull()
      expect(state.currentStory?.story).toBe('Test story content')
      // Word details error should be set
      expect(state.wordDetailsError).toBe('Failed to get word details')
      // Main error should still be null (not affected by word details failure)
      expect(state.error).toBeNull()
    })

    it('should handle network errors gracefully', async () => {
      mockFetchWithAuth.mockRejectedValue(new Error('Network error'))

      await store.dispatch(getWordDetails({ storyId: 'story-1', start: 0, end: 4 }))

      const state = store.getState().stories
      expect(state.isLoadingWordDetails).toBe(false)
      expect(state.wordDetailsError).toBe('Network error')
      expect(state.error).toBeNull()
    })
  })

  describe('clearWordDetailsError', () => {
    it('should clear wordDetailsError', () => {
      store = createTestStore({
        stories: {
          wordDetailsError: 'Failed to get word details',
        },
      })

      store.dispatch(clearWordDetailsError())

      expect(store.getState().stories.wordDetailsError).toBeNull()
    })

    it('should not affect other state properties', () => {
      store = createTestStore({
        stories: {
          wordDetailsError: 'Failed to get word details',
          error: 'Some other error',
          isLoadingWordDetails: true,
        },
      })

      store.dispatch(clearWordDetailsError())

      const state = store.getState().stories
      expect(state.wordDetailsError).toBeNull()
      expect(state.error).toBe('Some other error')
      expect(state.isLoadingWordDetails).toBe(true)
    })
  })

  describe('clearStory', () => {
    it('should clear wordDetailsError along with other story data', () => {
      store = createTestStore({
        stories: {
          currentStory: { id: 'story-1', story: 'Test', translations: {} },
          questions: [{ id: 'q1', text: 'Question', options: [], correct_answer: 0 }],
          wordDetails: { expression: 'test', translation: 'тест', grammatical_info: '', sentence_translation: '', example_sentence: '' },
          error: 'Some error',
          wordDetailsError: 'Word error',
        },
      })

      store.dispatch(clearStory())

      const state = store.getState().stories
      expect(state.currentStory).toBeNull()
      expect(state.questions).toEqual([])
      expect(state.wordDetails).toBeNull()
      expect(state.error).toBeNull()
      expect(state.wordDetailsError).toBeNull()
    })
  })
})
