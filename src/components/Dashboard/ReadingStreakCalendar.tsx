import { useTranslation } from '../../i18n/useTranslation'
import type { CalendarDay, CalendarView } from '../../hooks/useDashboard'

interface ReadingStreakCalendarProps {
  calendar: CalendarDay[]
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  isLoading: boolean
}

const VIEW_OPTIONS: CalendarView[] = ['weekly', 'monthly', 'yearly']

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getDate().toString()
}

function getWeekday(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getDay()
}

export function ReadingStreakCalendar({ calendar, view, onViewChange, isLoading }: ReadingStreakCalendarProps) {
  const { t } = useTranslation()

  const viewLabels: Record<CalendarView, string> = {
    weekly: t('dashboard.weekly'),
    monthly: t('dashboard.monthly'),
    yearly: t('dashboard.yearly'),
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('dashboard.readingStreak')}</h3>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: view === 'weekly' ? 7 : view === 'monthly' ? 30 : 52 }).map((_, i) => (
            <div key={i} className="h-8 w-8 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : view === 'yearly' ? (
        <YearlyGrid calendar={calendar} />
      ) : (
        <MonthlyWeeklyGrid calendar={calendar} view={view} />
      )}
    </div>
  )
}

function MonthlyWeeklyGrid({ calendar, view }: { calendar: CalendarDay[]; view: CalendarView }) {
  if (view === 'weekly') {
    return (
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((day) => (
          <DayCell key={day.date} day={day} showLabel />
        ))}
      </div>
    )
  }

  // Monthly: standard calendar grid with weekday alignment
  const firstWeekday = calendar.length > 0 ? getWeekday(calendar[0].date) : 0
  const paddedDays = Array.from({ length: firstWeekday }).map((_, i) => (
    <div key={`pad-${i}`} className="h-8 w-8" />
  ))

  return (
    <div className="grid grid-cols-7 gap-1">
      {paddedDays}
      {calendar.map((day) => (
        <DayCell key={day.date} day={day} showLabel />
      ))}
    </div>
  )
}

function YearlyGrid({ calendar }: { calendar: CalendarDay[] }) {
  // GitHub-style contribution graph: 7 rows (days of week) × N columns (weeks)
  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []

  if (calendar.length > 0) {
    // Pad first week
    const firstWeekday = getWeekday(calendar[0].date)
    for (let i = 0; i < firstWeekday; i++) {
      currentWeek.push({ date: '', has_read: false })
    }
  }

  for (const day of calendar) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return (
    <div className="flex gap-[2px] overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map((day, di) => (
            <div
              key={day.date || `empty-${wi}-${di}`}
              className={`h-3 w-3 rounded-sm ${
                !day.date
                  ? 'bg-transparent'
                  : day.has_read
                  ? 'bg-green-500'
                  : 'bg-muted'
              }`}
              title={day.date || undefined}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function DayCell({ day, showLabel }: { day: CalendarDay; showLabel?: boolean }) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium ${
        day.has_read
          ? 'bg-green-500 text-white'
          : 'bg-muted text-muted-foreground'
      }`}
      title={day.date}
    >
      {showLabel && formatDayLabel(day.date)}
    </div>
  )
}
