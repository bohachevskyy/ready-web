import { Fragment } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { cn } from '../../lib/utils'
import { DuoCard } from '../ui/duo-card'
import { Flame } from '../brand/icons'
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

function isToday(dateStr: string): boolean {
  const today = new Date()
  const isoToday =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0')
  return dateStr === isoToday
}

function getWeekdayLabels(): string[] {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' })
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, 1 + i)
    return formatter.format(date)
  })
}

export function ReadingStreakCalendar({
  calendar,
  view,
  onViewChange,
  isLoading,
}: ReadingStreakCalendarProps) {
  const { t } = useTranslation()

  const viewLabels: Record<CalendarView, string> = {
    weekly: t('dashboard.weekly'),
    monthly: t('dashboard.monthly'),
    yearly: t('dashboard.yearly'),
  }

  return (
    <DuoCard className="p-7 overflow-hidden">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[22px] font-black m-0 leading-tight">
            {t('dashboard.readingStreak')}
          </h3>
          <p className="text-ink-mute text-sm font-semibold mt-1.5 m-0">
            {t('dashboard.readingStreakDescription')}
          </p>
        </div>
        <div className="flex bg-cream-2 p-1 rounded-[10px]">
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'border-0 px-4 py-2 rounded-[8px] cursor-pointer font-extrabold text-[13px] font-sans',
                view === v
                  ? 'bg-paper text-ink shadow-[0_2px_0_hsl(var(--line-2))]'
                  : 'bg-transparent text-ink-mute',
              )}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <LoadingSkeleton view={view} />
        ) : view === 'yearly' ? (
          <YearlyGrid calendar={calendar} />
        ) : (
          <MonthlyWeeklyGrid calendar={calendar} view={view} />
        )}
      </div>
    </DuoCard>
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
              <div
                key={`${row}-${col}`}
                className="aspect-square animate-pulse rounded-[3px] bg-cream-2"
              />
            ))}
          </Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: view === 'weekly' ? 7 : 35 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-[12px] bg-cream-2" />
      ))}
    </div>
  )
}

function MonthlyWeeklyGrid({ calendar, view }: { calendar: CalendarDay[]; view: CalendarView }) {
  const weekdayLabels = getWeekdayLabels()
  const firstWeekday =
    view === 'monthly' && calendar.length > 0 ? getWeekday(calendar[0].date) : 0
  const paddedDays =
    view === 'monthly'
      ? Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`pad-${i}`} className="h-9 sm:h-10" />
        ))
      : []

  return (
    <div className="grid grid-cols-7 gap-2 justify-items-stretch">
      {weekdayLabels.map((label, i) => (
        <div
          key={i}
          className="flex items-center justify-center text-[13px] font-extrabold text-ink-mute pb-1"
        >
          {label}
        </div>
      ))}
      {paddedDays}
      {calendar.map((day) => (
        <DayCell key={day.date} day={day} />
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
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const weekdayLabels = getWeekdayLabels()

  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `auto repeat(${weeks.length}, 1fr)` }}
    >
      {Array.from({ length: 7 }, (_, row) => (
        <Fragment key={row}>
          <div className="flex items-center justify-end pr-1 text-[10px] font-extrabold text-ink-mute">
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
                  !day.date ? 'bg-transparent' : day.has_read ? 'bg-green' : 'bg-[#F2EAD0]',
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

function DayCell({ day }: { day: CalendarDay }) {
  const today = isToday(day.date)
  return (
    <div
      title={day.date}
      className={cn(
        'aspect-square w-full max-w-14 mx-auto rounded-[12px] grid place-items-center',
        'font-black text-base relative',
        day.has_read
          ? 'bg-green text-white shadow-[0_3px_0_hsl(var(--green-deep))]'
          : 'bg-[#F2EAD0] text-ink-mute',
        today && day.has_read && 'ring-2 ring-gold ring-offset-0',
      )}
    >
      {day.has_read ? (
        <Flame size={22} animate={today} />
      ) : (
        <span className="text-[14px]">{formatDayLabel(day.date)}</span>
      )}
    </div>
  )
}
