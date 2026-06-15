import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDashboard } from './useDashboard'
import { API_BASE_URL } from '../config/api'
import dashboardReducer, { DashboardState } from '../store/dashboardSlice'

// Mock fetchWithAuth
jest.mock('../utils/fetchWithAuth', () => ({
  fetchWithAuth: jest.fn(),
}))

import { fetchWithAuth } from '../utils/fetchWithAuth'

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

const mockDashboardResponse = {
  stats: { stories_read: 5, words_found: 42, words_practiced: 18 },
  calendar: [
    { date: '2026-03-15', has_read: true },
    { date: '2026-03-16', has_read: false },
  ],
}

function createWrapper(preloadedDashboardState?: Partial<DashboardState>) {
  const store = configureStore({
    reducer: { dashboard: dashboardReducer },
    preloadedState: preloadedDashboardState
      ? {
          dashboard: {
            dataByView: {},
            loadingByView: {},
            errorByView: {},
            lastFetchedByView: {},
            ...preloadedDashboardState,
          },
        }
      : undefined,
  })

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

function deferredResponse(response: unknown) {
  let resolve!: (value: Response) => void
  const promise = new Promise<Response>((res) => {
    resolve = res
  })

  return {
    promise,
    resolve: () => resolve({ ok: true, json: async () => response } as Response),
  }
}

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading on first launch until dashboard data is fetched', async () => {
    const deferred = deferredResponse(mockDashboardResponse)
    mockFetchWithAuth.mockReturnValue(deferred.promise)

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(true))
    expect(result.current.view).toBe('weekly')
    expect(result.current.stats).toBeNull()

    deferred.resolve()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=weekly`)
    expect(result.current.stats).toEqual(mockDashboardResponse.stats)
    expect(result.current.calendar).toEqual(mockDashboardResponse.calendar)
    expect(result.current.error).toBeNull()
  })

  it('fetches dashboard data on mount with default weekly view', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response)

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=weekly`)
    expect(result.current.stats).toEqual(mockDashboardResponse.stats)
    expect(result.current.calendar).toEqual(mockDashboardResponse.calendar)
    expect(result.current.error).toBeNull()
  })

  it('re-fetches when view changes', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response)

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setView('monthly')
    })

    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=monthly`))

    expect(result.current.isLoading).toBe(false)
  })

  it('handles fetch error', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch dashboard: 500')
    expect(result.current.stats).toBeNull()
  })

  it('handles network error', async () => {
    mockFetchWithAuth.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Network error')
  })

  it('uses initial view parameter', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response)

    const { result } = renderHook(() => useDashboard('yearly'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.view).toBe('yearly')
    expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=yearly`)
  })

  it('returns cached data without showing a loader while refreshing in the background', async () => {
    const deferred = deferredResponse({
      stats: { stories_read: 7, words_found: 50, words_practiced: 21 },
      calendar: [{ date: '2026-03-17', has_read: true }],
    })
    mockFetchWithAuth.mockReturnValue(deferred.promise)

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper({
        dataByView: { weekly: mockDashboardResponse },
        lastFetchedByView: { weekly: Date.now() },
      }),
    })

    expect(result.current.stats).toEqual(mockDashboardResponse.stats)
    expect(result.current.calendar).toEqual(mockDashboardResponse.calendar)

    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=weekly`))
    expect(result.current.isLoading).toBe(false)

    deferred.resolve()

    await waitFor(() => expect(result.current.stats).toEqual({
      stories_read: 7,
      words_found: 50,
      words_practiced: 21,
    }))
  })
})
