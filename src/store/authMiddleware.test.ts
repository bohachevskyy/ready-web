/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import { authMiddleware } from './authMiddleware'
import authReducer, { refreshAccessToken } from './authSlice'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('authMiddleware', () => {
  let store: ReturnType<typeof createTestStore>

  const createTestStore = (initialState: any = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [REHYDRATE],
          },
        }).concat(authMiddleware),
      preloadedState: {
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
          ...initialState.auth,
        },
      },
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should refresh token when expired on rehydration', async () => {
    const pastTime = new Date(Date.now() - 10000).toISOString()
    store = createTestStore({
      auth: {
        token: 'expired-token',
        tokenExpiresAt: pastTime,
        refreshToken: 'refresh-token',
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new-token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        refresh_token: 'new-refresh-token',
        refresh_token_expires_at: new Date(Date.now() + 86400000).toISOString(),
        user: { id: '1', email: 'test@test.com', firebase_uid: 'uid', created_at: '', updated_at: '' },
      }),
    } as Response)

    // Dispatch REHYDRATE action
    store.dispatch({
      type: REHYDRATE,
      payload: {
        auth: {
          token: 'expired-token',
          tokenExpiresAt: pastTime,
          refreshToken: 'refresh-token',
        },
      },
    })

    // Wait for async refresh
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Should have called refresh endpoint
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/auth/refresh',
      expect.objectContaining({
        method: 'POST',
      })
    )
  })

  it('should not refresh token when still valid on rehydration', async () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString()
    store = createTestStore({
      auth: {
        token: 'valid-token',
        tokenExpiresAt: futureTime,
        refreshToken: 'refresh-token',
      },
    })

    // Dispatch REHYDRATE action
    store.dispatch({
      type: REHYDRATE,
      payload: {
        auth: {
          token: 'valid-token',
          tokenExpiresAt: futureTime,
          refreshToken: 'refresh-token',
        },
      },
    })

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Should not have called refresh endpoint (token is not expired)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should handle network error gracefully on rehydration', async () => {
    const pastTime = new Date(Date.now() - 10000).toISOString()
    store = createTestStore({
      auth: {
        token: 'expired-token',
        tokenExpiresAt: pastTime,
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com', firebase_uid: 'uid', created_at: '', updated_at: '' },
      },
    })

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    // Dispatch REHYDRATE action
    store.dispatch({
      type: REHYDRATE,
      payload: {
        auth: {
          token: 'expired-token',
          tokenExpiresAt: pastTime,
          refreshToken: 'refresh-token',
        },
      },
    })

    // Wait for async refresh attempt
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Should have attempted refresh
    expect(mockFetch).toHaveBeenCalled()

    // Network error should be handled by reducer (sets networkError flag)
    const state = store.getState().auth
    expect(state.networkError).toBe(true)
  })

  it('should not refresh when no refresh token on rehydration', async () => {
    const pastTime = new Date(Date.now() - 10000).toISOString()
    store = createTestStore({
      auth: {
        token: 'expired-token',
        tokenExpiresAt: pastTime,
        refreshToken: null,
      },
    })

    // Dispatch REHYDRATE action
    store.dispatch({
      type: REHYDRATE,
      payload: {
        auth: {
          token: 'expired-token',
          tokenExpiresAt: pastTime,
          refreshToken: null,
        },
      },
    })

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Should not have called refresh endpoint
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should pass through non-REHYDRATE actions unchanged', () => {
    store = createTestStore()

    const action = { type: 'SOME_OTHER_ACTION', payload: 'test' }
    const result = store.dispatch(action as any)

    expect(result).toEqual(action)
  })
})

