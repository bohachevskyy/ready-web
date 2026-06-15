import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer, { fetchDashboard, clearDashboardCache } from './dashboardSlice'
import { clearAuth } from './authSlice'
import { API_BASE_URL } from '../config/api'

jest.mock('../utils/fetchWithAuth', () => ({
  fetchWithAuth: jest.fn(),
}))

import { fetchWithAuth } from '../utils/fetchWithAuth'

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

const mockDashboardResponse = {
  stats: { stories_read: 3, words_found: 12, words_practiced: 9 },
  calendar: [{ date: '2026-03-15', has_read: true }],
}

function createTestStore() {
  return configureStore({
    reducer: { dashboard: dashboardReducer },
  })
}

describe('dashboardSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches and caches dashboard data by view', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response)
    const store = createTestStore()

    await store.dispatch(fetchDashboard('weekly'))

    expect(mockFetchWithAuth).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard?view=weekly`)
    const state = store.getState().dashboard
    expect(state.dataByView.weekly).toEqual(mockDashboardResponse)
    expect(state.loadingByView.weekly).toBe(false)
    expect(state.errorByView.weekly).toBeNull()
    expect(state.lastFetchedByView.weekly).toEqual(expect.any(Number))
  })

  it('stores errors per view', async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: false, status: 500 } as Response)
    const store = createTestStore()

    await store.dispatch(fetchDashboard('monthly'))

    const state = store.getState().dashboard
    expect(state.loadingByView.monthly).toBe(false)
    expect(state.errorByView.monthly).toBe('Failed to fetch dashboard: 500')
  })

  it('does not start a duplicate request for a view that is already loading', async () => {
    mockFetchWithAuth.mockImplementation(() => new Promise<Response>(() => {}))
    const store = createTestStore()

    store.dispatch(fetchDashboard('weekly'))
    await store.dispatch(fetchDashboard('weekly'))

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1)
  })

  it('clears dashboard cache on clearDashboardCache and logout', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response)
    const store = createTestStore()

    await store.dispatch(fetchDashboard('weekly'))
    store.dispatch(clearDashboardCache())

    expect(store.getState().dashboard.dataByView).toEqual({})

    await store.dispatch(fetchDashboard('weekly'))
    store.dispatch(clearAuth())

    expect(store.getState().dashboard).toEqual({
      dataByView: {},
      loadingByView: {},
      errorByView: {},
      lastFetchedByView: {},
    })
  })
})
