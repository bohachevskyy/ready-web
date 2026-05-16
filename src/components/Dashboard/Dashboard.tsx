import { useDashboard } from '../../hooks/useDashboard'
import { ReadingStreakCalendar } from './ReadingStreakCalendar'

export function Dashboard() {
  const { calendar, isLoading, view, setView } = useDashboard()

  return (
    <section className="mt-7">
      <ReadingStreakCalendar
        calendar={calendar}
        view={view}
        onViewChange={setView}
        isLoading={isLoading}
      />
    </section>
  )
}
