import { renderHook, act, waitFor } from '@testing-library/react'
import { useDashboard } from './useDashboard'
import { API_BASE_URL } from '../config/api'

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

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches dashboard data on mount with default weekly view', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response)

    const { result } = renderHook(() => useDashboard())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.view).toBe('weekly')

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

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setView('monthly')
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=monthly`)
  })

  it('handles fetch error', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch dashboard: 500')
    expect(result.current.stats).toBeNull()
  })

  it('handles network error', async () => {
    mockFetchWithAuth.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Network error')
  })

  it('uses initial view parameter', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response)

    const { result } = renderHook(() => useDashboard('yearly'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.view).toBe('yearly')
    expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=yearly`)
  })
})
