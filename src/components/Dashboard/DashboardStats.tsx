import { BookOpen, Search, GraduationCap } from 'lucide-react'
import { Card } from '../ui/card'
import { useTranslation } from '../../i18n/useTranslation'
import type { DashboardStats as Stats } from '../../hooks/useDashboard'

interface DashboardStatsProps {
  stats: Stats | null
  isLoading: boolean
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const { t } = useTranslation()

  const items = [
    { icon: BookOpen, label: t('dashboard.storiesRead'), value: stats?.stories_read ?? 0 },
    { icon: Search, label: t('dashboard.wordsFound'), value: stats?.words_found ?? 0 },
    { icon: GraduationCap, label: t('dashboard.wordsPracticed'), value: stats?.words_practiced ?? 0 },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {items.map(({ icon: Icon, label, value }) => (
        <Card key={label} className="p-6 text-center transition-all hover:shadow-md">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            {isLoading ? (
              <div className="h-9 w-16 animate-pulse rounded-lg bg-muted" />
            ) : (
              <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
            )}
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
