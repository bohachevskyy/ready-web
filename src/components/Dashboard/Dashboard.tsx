import { useDashboard } from '../../hooks/useDashboard'
import { useTranslation } from '../../i18n/useTranslation'
import { DashboardStats } from './DashboardStats'
import { ReadingStreakCalendar } from './ReadingStreakCalendar'

export function Dashboard() {
  const { stats, calendar, isLoading, view, setView } = useDashboard()
  const { t } = useTranslation()

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-foreground mb-4">{t('dashboard.title')}</h2>
      <DashboardStats stats={stats} isLoading={isLoading} />
      <ReadingStreakCalendar
        calendar={calendar}
        view={view}
        onViewChange={setView}
        isLoading={isLoading}
      />
    </div>
  )
}
