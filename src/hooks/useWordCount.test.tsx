/// <reference types="jest" />

import React from 'react'
import { render, waitFor, screen, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useWordCount, resetPendingFetch } from './useWordCount'
import { fetchWordsCount } from '../store/wordsSlice'
import wordsReducer from '../store/wordsSlice'
import authReducer from '../store/authSlice'

// Mock fetchWithAuth - must be hoisted
jest.mock('../utils/fetchWithAuth')

import { fetchWithAuth } from '../utils/fetchWithAuth'
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

// Mock component that uses the hook
function TestComponent({ id }: { id: string }) {
  const { wordsCount, isLoading } = useWordCount()
  return (
    <div data-testid={`component-${id}`}>
      <span data-testid={`count-${id}`}>{wordsCount}</span>
      <span data-testid={`loading-${id}`}>{isLoading ? 'loading' : 'idle'}</span>
    </div>
  )
}

describe('useWordCount - Duplicate Request Prevention', () => {
  let store: ReturnType<typeof createTestStore>

  const createTestStore = (initialState: any = {}) => {
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

  beforeEach(() => {
    jest.clearAllMocks()
    resetPendingFetch()
    mockFetchWithAuth.mockClear()
    store = createTestStore()
    // Set up default mock that returns a proper Response-like object
    mockFetchWithAuth.mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ count: 0 }),
        text: async () => '{}',
        headers: new Headers(),
      } as Response
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetPendingFetch()
  })

  it('should only make one network request when multiple components mount simultaneously', async () => {
    mockFetchWithAuth.mockImplementationOnce(async () => {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ count: 42 }),
        text: async () => '{"count":42}',
        headers: new Headers(),
      } as Response
    })

    await act(async () => {
      render(
        <Provider store={store}>
          <TestComponent id="1" />
          <TestComponent id="2" />
          <TestComponent id="3" />
        </Provider>
      )
    })

    // Wait for the request to complete
    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledTimes(1)
    }, { timeout: 5000 })

    // Wait for state to update and verify all components received the same count
    await waitFor(() => {
      expect(screen.getByTestId('count-1')).toHaveTextContent('42')
    }, { timeout: 5000 })
    
    expect(screen.getByTestId('count-2')).toHaveTextContent('42')
    expect(screen.getByTestId('count-3')).toHaveTextContent('42')
  })

  it('should prevent duplicate requests when thunk condition returns false', async () => {
    store = createTestStore({
      words: {
        isCountLoading: true,
      },
    })

    await act(async () => {
      render(
        <Provider store={store}>
          <TestComponent id="1" />
        </Provider>
      )
    })

    // Wait a bit to ensure no additional requests are made
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
    })

    // Should not have been called because isCountLoading is true
    expect(mockFetchWithAuth).not.toHaveBeenCalled()
  })

  it('should allow force refresh even when loading', async () => {
    store = createTestStore({
      words: {
        isCountLoading: true,
        wordsCount: 10,
      },
    })

    mockFetchWithAuth.mockImplementationOnce(async () => {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ count: 42 }),
        text: async () => '{"count":42}',
        headers: new Headers(),
      } as Response
    })

    // Force refresh
    await act(async () => {
      await store.dispatch(fetchWordsCount({ force: true }))
    })

    // Should have been called because force=true
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1)
  })

  it('should use cached value when cache is fresh', async () => {
    const fiveMinutesAgo = Date.now() - 2 * 60 * 1000 // 2 minutes ago (within 5 min cache)
    
    store = createTestStore({
      words: {
        wordsCount: 100,
        countLastFetched: fiveMinutesAgo,
      },
    })

    await act(async () => {
      render(
        <Provider store={store}>
          <TestComponent id="1" />
        </Provider>
      )
    })

    // Wait a bit
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
    })

    // Should not have been called because cache is fresh
    expect(mockFetchWithAuth).not.toHaveBeenCalled()
    
    // Should show cached value
    expect(screen.getByTestId('count-1')).toHaveTextContent('100')
  })

  it('should not make duplicate requests when components mount at different times', async () => {
    mockFetchWithAuth.mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ count: 42 }),
        text: async () => '{"count":42}',
        headers: new Headers(),
      } as Response
    })

    const { rerender } = await act(async () => {
      return render(
        <Provider store={store}>
          <TestComponent id="1" />
        </Provider>
      )
    })

    // Wait for first request
    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledTimes(1)
    }, { timeout: 5000 })

    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('count-1')).toHaveTextContent('42')
    }, { timeout: 5000 })

    // Mount second component after first request completes
    await act(async () => {
      rerender(
        <Provider store={store}>
          <TestComponent id="1" />
          <TestComponent id="2" />
        </Provider>
      )
    })

    // Wait a bit for any potential requests
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    })

    // Should still only have one call (second component should use cached value)
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1)
    
    // Both should show the same count
    expect(screen.getByTestId('count-1')).toHaveTextContent('42')
    expect(screen.getByTestId('count-2')).toHaveTextContent('42')
  })

  it('should return default value of 0 when wordsCount is undefined', () => {
    store = createTestStore({
      words: {
        wordsCount: undefined,
        isCountLoading: false,
      },
    })

    render(
      <Provider store={store}>
        <TestComponent id="1" />
      </Provider>
    )

    // Should show default value of 0
    expect(screen.getByTestId('count-1')).toHaveTextContent('0')
  })
})
