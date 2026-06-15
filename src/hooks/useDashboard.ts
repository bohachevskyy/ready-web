import { useState, useEffect } from 'react'
import { fetchDashboard, type CalendarView } from '../store/dashboardSlice'
import { useAppDispatch, useAppSelector } from '../store/store'

export type { CalendarView, DashboardStats, CalendarDay, DashboardData } from '../store/dashboardSlice'

export function useDashboard(initialView: CalendarView = 'weekly') {
  const [view, setView] = useState<CalendarView>(initialView)
  const dispatch = useAppDispatch()
  const data = useAppSelector((state) => state.dashboard.dataByView[view] ?? null)
  const isFetching = useAppSelector((state) => state.dashboard.loadingByView[view] === true)
  const error = useAppSelector((state) => state.dashboard.errorByView[view] ?? null)

  useEffect(() => {
    dispatch(fetchDashboard(view))
  }, [view, dispatch])

  return {
    stats: data?.stats ?? null,
    calendar: data?.calendar ?? [],
    isLoading: isFetching && data === null,
    error,
    view,
    setView,
  }
}
