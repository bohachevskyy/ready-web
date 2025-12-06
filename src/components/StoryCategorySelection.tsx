import { Card } from "./ui/card"
import { useTranslation } from "../i18n/useTranslation"
import {
  BookOpen,
  Sparkles,
  Compass,
  Search,
  Wand2,
  Rocket,
  Laugh,
  Heart,
  Briefcase,
  TrendingUp,
  Home,
  UtensilsCrossed,
  Clock,
  Microscope,
  Atom,
  Globe,
  Cpu,
  Palette,
  User,
  Brain,
} from "lucide-react"

type StoryDomain = string

interface StoryCategorySelectionProps {
  onSelectDomain: (domain: StoryDomain) => void
}

interface DomainConfig {
  icon: React.ComponentType<{ className?: string }>
}

const NONFICTION_DOMAINS: Record<string, DomainConfig> = {
  history: {
    icon: Clock,
  },
  biology: {
    icon: Microscope,
  },
  physics: {
    icon: Atom,
  },
  earth: {
    icon: Globe,
  },
  technology: {
    icon: Cpu,
  },
  art: {
    icon: Palette,
  },
  biography: {
    icon: User,
  },
  psychology: {
    icon: Brain,
  },
}

const FICTION_DOMAINS: Record<string, DomainConfig> = {
  adventure_quest: {
    icon: Compass,
  },
  mystery_detective: {
    icon: Search,
  },
  fantasy_magic: {
    icon: Wand2,
  },
  sci_fi_future: {
    icon: Rocket,
  },
  humor_comedy: {
    icon: Laugh,
  },
}

const EVERYDAY_DOMAINS: Record<string, DomainConfig> = {
  relationships: {
    icon: Heart,
  },
  work_career: {
    icon: Briefcase,
  },
  personal_growth: {
    icon: TrendingUp,
  },
  home_lifestyle: {
    icon: Home,
  },
  food_culture: {
    icon: UtensilsCrossed,
  },
}

export function StoryCategorySelection({ onSelectDomain }: StoryCategorySelectionProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('stories.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('stories.pageDescription')}</p>
        </div>

        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{t('stories.categories.nonfiction')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {Object.entries(NONFICTION_DOMAINS).map(([key, domain]) => {
                const Icon = domain.icon
                return (
                  <Card
                    key={key}
                    className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                    onClick={() => onSelectDomain(key)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{t(`stories.domains.nonfiction.${key}.name`)}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t(`stories.domains.nonfiction.${key}.description`)}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{t('stories.categories.fiction')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {Object.entries(FICTION_DOMAINS).map(([key, domain]) => {
                const Icon = domain.icon
                return (
                  <Card
                    key={key}
                    className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                    onClick={() => onSelectDomain(key)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{t(`stories.domains.fiction.${key}.name`)}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t(`stories.domains.fiction.${key}.description`)}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{t('stories.categories.everydayLife')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {Object.entries(EVERYDAY_DOMAINS).map(([key, domain]) => {
                const Icon = domain.icon
                return (
                  <Card
                    key={key}
                    className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                    onClick={() => onSelectDomain(key)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{t(`stories.domains.everyday.${key}.name`)}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t(`stories.domains.everyday.${key}.description`)}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
