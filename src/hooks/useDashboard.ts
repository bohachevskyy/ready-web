import { useState, useEffect, useCallback } from 'react'
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

export function useDashboard(initialView: CalendarView = 'weekly') {
  const [view, setView] = useState<CalendarView>(initialView)
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (v: CalendarView) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/dashboard?view=${v}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`)
      }
      const json = await response.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard(view)
  }, [view, fetchDashboard])

  return {
    stats: data?.stats ?? null,
    calendar: data?.calendar ?? [],
    isLoading,
    error,
    view,
    setView,
  }
}
