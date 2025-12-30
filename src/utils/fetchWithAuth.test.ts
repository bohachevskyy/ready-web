/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../store/authSlice'

// Mock fetch
global.fetch = jest.fn()

// Create a test store that we can control
let mockTestStore: ReturnType<typeof createTestStore> | null = null

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

// Mock the store module before importing fetchWithAuth
// Use mockTestStore (prefixed with 'mock') to satisfy Jest's factory requirements
jest.mock('../store/store', () => ({
  store: {
    getState: () => {
      if (!mockTestStore) {
        throw new Error('mockTestStore not initialized')
      }
      return mockTestStore.getState()
    },
    dispatch: (action: any) => {
      if (!mockTestStore) {
        throw new Error('mockTestStore not initialized')
      }
      return mockTestStore.dispatch(action)
    },
  },
}))

import { fetchWithAuth } from './fetchWithAuth'

describe('fetchWithAuth', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    mockTestStore = createTestStore()
    mockFetch.mockClear()
  })

  afterEach(() => {
    mockTestStore = null
  })

  it('should add Authorization header when token exists', async () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString()
    mockTestStore = createTestStore({
      auth: {
        token: 'valid-token',
        tokenExpiresAt: futureTime,
        refreshToken: 'refresh-token',
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response)

    await fetchWithAuth('http://localhost:8080/api/test')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          get: expect.any(Function),
        }),
      })
    )

    const callArgs = mockFetch.mock.calls[0]
    const headers = callArgs[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer valid-token')
  })

  it('should refresh token when token is expiring soon', async () => {
    const expiringSoon = new Date(Date.now() + 3000).toISOString() // 3 seconds from now
    mockTestStore = createTestStore({
      auth: {
        token: 'old-token',
        tokenExpiresAt: expiringSoon,
        refreshToken: 'refresh-token',
      },
    })

    // Mock refresh endpoint
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

    // Mock the actual API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response)

    await fetchWithAuth('http://localhost:8080/api/test')

    // Should have called refresh endpoint first
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/auth/refresh',
      expect.objectContaining({
        method: 'POST',
      })
    )

    // Should have called the actual API with new token
    const apiCall = mockFetch.mock.calls.find(
      (call) => call[0] === 'http://localhost:8080/api/test'
    )
    expect(apiCall).toBeDefined()
  })

  it('should throw error when token is expiring and no refresh token available', async () => {
    const expiringSoon = new Date(Date.now() + 3000).toISOString()
    mockTestStore = createTestStore({
      auth: {
        token: 'old-token',
        tokenExpiresAt: expiringSoon,
        refreshToken: null,
      },
    })

    await expect(fetchWithAuth('http://localhost:8080/api/test')).rejects.toThrow(
      'No refresh token available'
    )

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should throw error when token refresh fails', async () => {
    const expiringSoon = new Date(Date.now() + 3000).toISOString()
    mockTestStore = createTestStore({
      auth: {
        token: 'old-token',
        tokenExpiresAt: expiringSoon,
        refreshToken: 'refresh-token',
      },
    })

    // Mock refresh endpoint to fail
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchWithAuth('http://localhost:8080/api/test')).rejects.toThrow(
      'Token refresh failed'
    )
  })

  it('should not refresh token when token is still valid', async () => {
    const futureTime = new Date(Date.now() + 60000).toISOString() // 1 minute from now
    mockTestStore = createTestStore({
      auth: {
        token: 'valid-token',
        tokenExpiresAt: futureTime,
        refreshToken: 'refresh-token',
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response)

    await fetchWithAuth('http://localhost:8080/api/test')

    // Should not call refresh endpoint
    const refreshCalls = mockFetch.mock.calls.filter(
      (call) => call[0] === 'http://localhost:8080/auth/refresh'
    )
    expect(refreshCalls).toHaveLength(0)

    // Should call the API directly
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should handle expired token (past expiration)', async () => {
    const pastTime = new Date(Date.now() - 10000).toISOString() // 10 seconds ago
    mockTestStore = createTestStore({
      auth: {
        token: 'expired-token',
        tokenExpiresAt: pastTime,
        refreshToken: 'refresh-token',
      },
    })

    // Mock refresh endpoint
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response)

    await fetchWithAuth('http://localhost:8080/api/test')

    // Should have called refresh endpoint
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/auth/refresh',
      expect.any(Object)
    )
  })

  it('should preserve custom headers when making request', async () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString()
    mockTestStore = createTestStore({
      auth: {
        token: 'valid-token',
        tokenExpiresAt: futureTime,
        refreshToken: 'refresh-token',
      },
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response)

    const customHeaders = new Headers()
    customHeaders.set('Content-Type', 'application/json')
    customHeaders.set('X-Custom-Header', 'custom-value')

    await fetchWithAuth('http://localhost:8080/api/test', {
      headers: customHeaders,
    })

    const callArgs = mockFetch.mock.calls[0]
    const headers = callArgs[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer valid-token')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('X-Custom-Header')).toBe('custom-value')
  })
})

