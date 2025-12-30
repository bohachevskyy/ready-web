/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit'
import authReducer, { refreshAccessToken, clearAuth } from './authSlice'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('authSlice - refreshAccessToken', () => {
  let store: ReturnType<typeof createTestStore>

  const createTestStore = (initialState: any = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
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
    store = createTestStore()
  })

  it('should set networkError to true when refresh fails with network error (status 0)', async () => {
    store = createTestStore({
      auth: {
        token: 'old-token',
        tokenExpiresAt: new Date(Date.now() - 1000).toISOString(),
        refreshToken: 'refresh-token',
        networkError: false,
        user: { id: '1', email: 'test@test.com', firebase_uid: 'uid', created_at: '', updated_at: '' },
      },
    })

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await store.dispatch(refreshAccessToken('refresh-token'))

    const state = store.getState().auth
    expect(state.networkError).toBe(true)
    expect(state.token).toBe('old-token') // Should keep old token
    expect(state.user).not.toBeNull() // Should keep user
  })

  it('should clear auth when refresh fails with 401 error', async () => {
    store = createTestStore({
      auth: {
        token: 'old-token',
        tokenExpiresAt: new Date(Date.now() - 1000).toISOString(),
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com' } as any,
        networkError: false,
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as Response)

    await store.dispatch(refreshAccessToken('refresh-token'))

    const state = store.getState().auth
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.networkError).toBe(false)
    expect(state.error).toBe('Session expired. Please login again.')
  })

  it('should clear auth when refresh fails with 403 error', async () => {
    store = createTestStore({
      auth: {
        token: 'old-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com' } as any,
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden' }),
    } as Response)

    await store.dispatch(refreshAccessToken('refresh-token'))

    const state = store.getState().auth
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })

  it('should clear networkError on successful refresh', async () => {
    store = createTestStore({
      auth: {
        token: 'old-token',
        refreshToken: 'refresh-token',
        networkError: true, // Start with network error
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new-token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        refresh_token: 'new-refresh-token',
        refresh_token_expires_at: new Date(Date.now() + 86400000).toISOString(),
        user: { id: '1', email: 'test@test.com' },
      }),
    } as Response)

    await store.dispatch(refreshAccessToken('refresh-token'))

    const state = store.getState().auth
    expect(state.networkError).toBe(false)
    expect(state.token).toBe('new-token')
  })

  it('should update token and user on successful refresh', async () => {
    store = createTestStore({
      auth: {
        token: 'old-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'old@test.com' } as any,
      },
    })

    const newUser = { id: '1', email: 'new@test.com', firebase_uid: 'uid', created_at: '', updated_at: '' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new-token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        refresh_token: 'new-refresh-token',
        refresh_token_expires_at: new Date(Date.now() + 86400000).toISOString(),
        user: newUser,
      }),
    } as Response)

    await store.dispatch(refreshAccessToken('refresh-token'))

    const state = store.getState().auth
    expect(state.token).toBe('new-token')
    expect(state.user).toEqual(newUser)
    expect(state.refreshToken).toBe('new-refresh-token')
  })

  it('should keep existing refresh token if backend does not return new one', async () => {
    store = createTestStore({
      auth: {
        token: 'old-token',
        refreshToken: 'existing-refresh-token',
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new-token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        // No refresh_token in response
        user: { id: '1', email: 'test@test.com' },
      }),
    } as Response)

    await store.dispatch(refreshAccessToken('existing-refresh-token'))

    const state = store.getState().auth
    expect(state.refreshToken).toBe('existing-refresh-token') // Should keep existing
  })
})

describe('authSlice - clearAuth', () => {
  let store: ReturnType<typeof createTestStore>

  const createTestStore = (initialState: any = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
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

  it('should clear all auth state including networkError', () => {
    store = createTestStore({
      auth: {
        token: 'token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com' } as any,
        networkError: true,
      },
    })

    store.dispatch(clearAuth())

    const state = store.getState().auth
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.networkError).toBe(false)
  })
})

