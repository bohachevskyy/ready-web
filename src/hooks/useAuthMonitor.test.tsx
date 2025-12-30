/// <reference types="jest" />

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useAuthMonitor } from './useAuthMonitor'
import authReducer, { clearAuth, refreshAccessToken } from '../store/authSlice'

// Mock useNavigate and useLocation
const mockNavigate = jest.fn()
const mockLocation = { pathname: '/test' }

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  }
})

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

// Test component that uses the hook
function TestComponent() {
  useAuthMonitor()
  return <div>Test</div>
}

describe('useAuthMonitor', () => {
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
    mockNavigate.mockClear()
    store = createTestStore()
  })

  it('should redirect to login when token is cleared', async () => {
    store = createTestStore({
      auth: {
        token: 'existing-token',
        refreshToken: 'refresh-token',
      },
    })

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    // Clear auth
    store.dispatch(clearAuth())

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  it('should not redirect when already on login page', async () => {
    // Update mock location to be on login page
    mockLocation.pathname = '/login'

    store = createTestStore({
      auth: {
        token: 'existing-token',
      },
    })

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    store.dispatch(clearAuth())

    // Should not navigate if already on login
    await new Promise((resolve) => setTimeout(resolve, 100))
    // Navigate should not be called since we're already on login
    expect(mockNavigate).not.toHaveBeenCalled()
    
    // Reset for other tests
    mockLocation.pathname = '/test'
  })

  it('should detect cross-tab logout via storage event', async () => {
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'logout-event',
      newValue: Date.now().toString(),
    })

    window.dispatchEvent(storageEvent)

    await waitFor(() => {
      const state = store.getState().auth
      expect(state.token).toBeNull()
    })
  })

  it('should detect cross-tab logout via persist:auth removal', async () => {
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    // Simulate persist:auth being cleared
    const storageEvent = new StorageEvent('storage', {
      key: 'persist:auth',
      oldValue: 'some-value',
      newValue: null,
    })

    window.dispatchEvent(storageEvent)

    await waitFor(() => {
      const state = store.getState().auth
      expect(state.token).toBeNull()
    })
  })

  it('should refresh token when expired on visibility change', async () => {
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
        user: { id: '1', email: 'test@test.com' },
      }),
    } as Response)

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    // Simulate tab becoming visible
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
    })

    const visibilityEvent = new Event('visibilitychange')
    document.dispatchEvent(visibilityEvent)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should clear auth when token expired and no refresh token on visibility change', async () => {
    const pastTime = new Date(Date.now() - 10000).toISOString()
    store = createTestStore({
      auth: {
        token: 'expired-token',
        tokenExpiresAt: pastTime,
        refreshToken: null,
      },
    })

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    // Simulate tab becoming visible
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
    })

    const visibilityEvent = new Event('visibilitychange')
    document.dispatchEvent(visibilityEvent)

    await waitFor(() => {
      const state = store.getState().auth
      expect(state.token).toBeNull()
    })
  })

  it('should not refresh token when still valid on visibility change', async () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString()
    store = createTestStore({
      auth: {
        token: 'valid-token',
        tokenExpiresAt: futureTime,
        refreshToken: 'refresh-token',
      },
    })

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    // Simulate tab becoming visible
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
    })

    const visibilityEvent = new Event('visibilitychange')
    document.dispatchEvent(visibilityEvent)

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Should not have called refresh
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

