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
    <div className="grid gap-4 grid-cols-3">
      {items.map(({ icon: Icon, label, value }) => (
        <Card key={label} className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
            {isLoading ? (
              <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <span className="text-2xl font-bold text-foreground">{value}</span>
            )}
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
