import { configureStore } from '@reduxjs/toolkit'
import wordsReducer from '../../store/wordsSlice'
import authReducer from '../../store/authSlice'
import { Word } from '../../types'
import { fetchWithAuth } from '../../utils/fetchWithAuth'

export const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

/**
 * Helper to create a test store with custom initial state
 */
export const createTestStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      words: wordsReducer,
      auth: authReducer,
    },
    preloadedState: {
      words: {
        words: [],
        wordsCount: undefined,
        sessionTotal: undefined,
        countLastFetched: null,
        isLoading: false,
        isCountLoading: false,
        isSubmitting: false,
        error: null,
        lastWordId: undefined,
        hasNextPage: true,
        currentIndex: 0,
        ...initialState.words,
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
 * Helper to create mock Word objects for testing
 */
export const createMockWord = (id: string, overrides: Partial<Word> = {}): Word => ({
  id,
  name: `word-${id}`,
  translation: `translation-${id}`,
  sentence_context: `This is a sentence with word-${id}`,
  sentence_translation: `This is a translated sentence`,
  due_at: new Date().toISOString(),
  stability: 1.0,
  difficulty: 5.0,
  elapsed_days: 0,
  scheduled_days: 1,
  reps: 0,
  lapses: 0,
  state: 'New',
  ...overrides,
})

/**
 * Helper to create a successful Response mock
 */
export const createSuccessResponse = (data: any): Response => ({
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
export const createErrorResponse = (status: number = 500): Response => ({
  ok: false,
  status,
  statusText: status === 500 ? 'Internal Server Error' : 'Error',
  json: async () => ({}),
  text: async () => '{}',
  headers: new Headers(),
} as Response)
