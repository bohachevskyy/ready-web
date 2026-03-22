import { useDashboard } from '../../hooks/useDashboard'
import { useTranslation } from '../../i18n/useTranslation'
import { DashboardStats } from './DashboardStats'
import { ReadingStreakCalendar } from './ReadingStreakCalendar'

export function Dashboard() {
  const { stats, calendar, isLoading, view, setView } = useDashboard()
  const { t } = useTranslation()

  return (
    <section className="mt-12 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h2>
      <DashboardStats stats={stats} isLoading={isLoading} />
      <ReadingStreakCalendar
        calendar={calendar}
        view={view}
        onViewChange={setView}
        isLoading={isLoading}
      />
    </section>
  )
}
