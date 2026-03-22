import { Fragment } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { cn } from '../../lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
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

function getWeekdayLabels(): string[] {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' })
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, 1 + i) // Jan 1 2023 is Sunday
    return formatter.format(date)
  })
}

export function ReadingStreakCalendar({ calendar, view, onViewChange, isLoading }: ReadingStreakCalendarProps) {
  const { t } = useTranslation()

  const viewLabels: Record<CalendarView, string> = {
    weekly: t('dashboard.weekly'),
    monthly: t('dashboard.monthly'),
    yearly: t('dashboard.yearly'),
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('dashboard.readingStreak')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{t('dashboard.readingStreakDescription')}</p>
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {VIEW_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  view === v
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {viewLabels[v]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton view={view} />
        ) : view === 'yearly' ? (
          <YearlyGrid calendar={calendar} />
        ) : (
          <MonthlyWeeklyGrid calendar={calendar} view={view} />
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton({ view }: { view: CalendarView }) {
  if (view === 'yearly') {
    return (
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `auto repeat(52, 1fr)` }}
      >
        {Array.from({ length: 7 }, (_, row) => (
          <Fragment key={row}>
            <div className="h-2" />
            {Array.from({ length: 52 }).map((_, col) => (
              <div key={`${row}-${col}`} className="aspect-square animate-pulse rounded-[3px] bg-muted" />
            ))}
          </Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: view === 'weekly' ? 7 : 35 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}

function MonthlyWeeklyGrid({ calendar, view }: { calendar: CalendarDay[]; view: CalendarView }) {
  const weekdayLabels = getWeekdayLabels()

  const firstWeekday = view === 'monthly' && calendar.length > 0 ? getWeekday(calendar[0].date) : 0
  const paddedDays = view === 'monthly'
    ? Array.from({ length: firstWeekday }).map((_, i) => (
        <div key={`pad-${i}`} className="h-9 sm:h-10" />
      ))
    : []

  return (
    <div className="grid grid-cols-7 gap-1.5 justify-items-center">
      {weekdayLabels.map((label, i) => (
        <div key={i} className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">
          {label}
        </div>
      ))}
      {paddedDays}
      {calendar.map((day) => (
        <DayCell key={day.date} day={day} showLabel />
      ))}
    </div>
  )
}

function YearlyGrid({ calendar }: { calendar: CalendarDay[] }) {
  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []

  if (calendar.length > 0) {
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

  const weekdayLabels = getWeekdayLabels()

  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `auto repeat(${weeks.length}, 1fr)` }}
    >
      {/* Weekday labels column + week columns, rendered row by row */}
      {Array.from({ length: 7 }, (_, row) => (
        <Fragment key={row}>
          <div className="flex items-center justify-end pr-1 text-[10px] text-muted-foreground">
            {row % 2 === 0 ? weekdayLabels[row] : ''}
          </div>
          {weeks.map((week, wi) => {
            const day = week[row]
            if (!day) return <div key={`empty-${wi}-${row}`} />
            return (
              <div
                key={day.date || `empty-${wi}-${row}`}
                className={cn(
                  'aspect-square rounded-[3px]',
                  !day.date
                    ? 'bg-transparent'
                    : day.has_read
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
                title={day.date || undefined}
              />
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}

function DayCell({ day, showLabel }: { day: CalendarDay; showLabel?: boolean }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg text-xs font-medium transition-colors',
        day.has_read
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      )}
      title={day.date}
    >
      {showLabel && formatDayLabel(day.date)}
    </div>
  )
}
