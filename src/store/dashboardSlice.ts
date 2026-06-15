import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clearAuth } from './authSlice'
import { fetchWithAuth } from '../utils/fetchWithAuth'
import { API_BASE_URL } from '../config/api'

export type CalendarView = 'weekly' | 'monthly' | 'yearly'

export interface DashboardStats {
  stories_read: number
  words_found: number
  words_practiced: number
}

export interface CalendarDay {
  date: string
  has_read: boolean
}

export interface DashboardData {
  stats: DashboardStats
  calendar: CalendarDay[]
}

export interface DashboardState {
  dataByView: Partial<Record<CalendarView, DashboardData>>
  loadingByView: Partial<Record<CalendarView, boolean>>
  errorByView: Partial<Record<CalendarView, string | null>>
  lastFetchedByView: Partial<Record<CalendarView, number>>
}

export const initialState: DashboardState = {
  dataByView: {},
  loadingByView: {},
  errorByView: {},
  lastFetchedByView: {},
}

export const fetchDashboard = createAsyncThunk<
  { view: CalendarView; data: DashboardData },
  CalendarView,
  { rejectValue: string }
>(
  'dashboard/fetchDashboard',
  async (view, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/dashboard?view=${view}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`)
      }

      const data = await response.json()
      return { view, data }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  },
  {
    condition: (view, { getState }) => {
      const state = getState() as { dashboard?: DashboardState }
      return state.dashboard?.loadingByView[view] !== true
    },
  },
)

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardCache: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state, action) => {
        const view = action.meta.arg
        state.loadingByView[view] = true
        state.errorByView[view] = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        const { view, data } = action.payload
        state.loadingByView[view] = false
        state.dataByView[view] = data
        state.lastFetchedByView[view] = Date.now()
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        const view = action.meta.arg
        state.loadingByView[view] = false
        state.errorByView[view] = action.payload || action.error.message || 'Unknown error'
      })
      .addCase(clearAuth, () => initialState)
  },
})

export const { clearDashboardCache } = dashboardSlice.actions

export default dashboardSlice.reducer
