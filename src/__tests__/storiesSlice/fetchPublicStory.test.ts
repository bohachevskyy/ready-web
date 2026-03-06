import { configureStore } from '@reduxjs/toolkit'
import storiesReducer, { fetchPublicStoryById } from '../../store/storiesSlice'
import authReducer from '../../store/authSlice'

const createTestStore = () => {
  return configureStore({
    reducer: {
      stories: storiesReducer,
      auth: authReducer,
    },
    preloadedState: {
      stories: {
        currentStory: null,
        readerStatus: null,
        questions: [],
        wordDetails: null,
        isGeneratingStory: false,
        isFetchingStory: false,
        isLoadingQuestions: false,
        isLoadingWordDetails: false,
        isSavingWords: false,
        isSubmittingFeedback: false,
        error: null,
        wordDetailsError: null,
      },
      auth: {
        token: null,
        tokenExpiresAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        user: null,
        isLoading: false,
        error: null,
        networkError: false,
        uiLanguage: null,
      },
    },
  })
}

describe('storiesSlice - fetchPublicStoryById', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should set isFetchingStory to true on pending', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    store.dispatch(fetchPublicStoryById('story-id'))

    const state = store.getState().stories
    expect(state.isFetchingStory).toBe(true)
    expect(state.error).toBeNull()
  })

  it('should fetch story without auth headers', async () => {
    const mockData = {
      id: 'story-id',
      text: 'Once upon a time...',
      translation: { hello: 'hola' },
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    await store.dispatch(fetchPublicStoryById('story-id'))

    // Verify fetch was called without auth headers
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/stories/story-id'))
    const callArgs = (global.fetch as jest.Mock).mock.calls[0]
    // Should only have URL, no init with Authorization header
    expect(callArgs.length).toBe(1)

    const state = store.getState().stories
    expect(state.isFetchingStory).toBe(false)
    expect(state.currentStory).toEqual({
      id: 'story-id',
      story: 'Once upon a time...',
      title: '',
      translations: { hello: 'hola' },
    })
  })

  it('should handle 404 error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    })

    await store.dispatch(fetchPublicStoryById('nonexistent-id'))

    const state = store.getState().stories
    expect(state.isFetchingStory).toBe(false)
    expect(state.error).toBe('Story not found')
    expect(state.currentStory).toBeNull()
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    await store.dispatch(fetchPublicStoryById('story-id'))

    const state = store.getState().stories
    expect(state.isFetchingStory).toBe(false)
    expect(state.error).toBe('Network error')
  })

  it('should handle missing translation field gracefully', async () => {
    const mockData = {
      id: 'story-id',
      text: 'A story without translations',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    await store.dispatch(fetchPublicStoryById('story-id'))

    const state = store.getState().stories
    expect(state.currentStory?.translations).toEqual({})
  })
})
