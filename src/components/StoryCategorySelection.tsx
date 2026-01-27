import { Card } from "./ui/card"
import { useTranslation } from "../i18n/useTranslation"
import { useStoryCategories, CategoryType } from "../hooks/useStoryCategories"
import {
  BookOpen,
  Sparkles,
  Compass,
  Search,
  Rocket,
  Laugh,
  TrendingUp,
  Home,
  Clock,
  Microscope,
  Atom,
  Globe,
  Cpu,
  Palette,
  User,
  Brain,
  Users,
  GraduationCap,
  Trophy,
  Map,
  Dog,
  Puzzle,
  Code,
  Briefcase,
  Building2,
  Crown,
  LineChart,
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
  sci_fi_future: {
    icon: Rocket,
  },
  humor_comedy: {
    icon: Laugh,
  },
}



const TEEN_DOMAINS: Record<string, DomainConfig> = {
  teen_friendship: {
    icon: Users,
  },
  teen_family: {
    icon: Home,
  },
  teen_school_life: {
    icon: GraduationCap,
  },
  teen_sports_games: {
    icon: Trophy,
  },
  teen_hobbies_talents: {
    icon: Palette,
  },
  teen_adventures: {
    icon: Map,
  },
  teen_animals_pets: {
    icon: Dog,
  },
  teen_mystery_puzzles: {
    icon: Puzzle,
  },
  teen_technology_digital: {
    icon: Code,
  },
  teen_money_entrepreneurship: {
    icon: TrendingUp,
  },
  teen_culture_traditions: {
    icon: Globe,
  },
  teen_future_dreams: {
    icon: Rocket,
  },
}

const PROFESSIONAL_DOMAINS: Record<string, DomainConfig> = {
  business_entrepreneurship: {
    icon: Briefcase,
  },
  career_workplace: {
    icon: Building2,
  },
  leadership_management: {
    icon: Crown,
  },
  finance_economics: {
    icon: LineChart,
  },
}

const CATEGORY_CONFIGS: Record<CategoryType, {
  domains: Record<string, DomainConfig>
  icon: React.ComponentType<{ className?: string }>
}> = {
  teens: { domains: TEEN_DOMAINS, icon: Users },
  nonfiction: { domains: NONFICTION_DOMAINS, icon: BookOpen },
  fiction: { domains: FICTION_DOMAINS, icon: Sparkles },
  professional: { domains: PROFESSIONAL_DOMAINS, icon: Briefcase },
}

export function StoryCategorySelection({ onSelectDomain }: StoryCategorySelectionProps) {
  const { t } = useTranslation()
  const { visibleCategories } = useStoryCategories()

  const renderCategorySection = (categoryKey: CategoryType) => {
    const { domains, icon: Icon } = CATEGORY_CONFIGS[categoryKey]
    const title = t(`stories.categories.${categoryKey}`)

    return (
      <div key={categoryKey}>
        <div className="flex items-center gap-3 mb-6">
          <Icon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
          {Object.entries(domains).map(([key, domain]) => {
            const DomainIcon = domain.icon
            return (
              <Card
                key={key}
                className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                onClick={() => onSelectDomain(key)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                    <DomainIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-sm leading-tight">{t(`stories.domains.${categoryKey}.${key}.name`)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t(`stories.domains.${categoryKey}.${key}.description`)}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('stories.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('stories.pageDescription')}</p>
        </div>

        <div className="space-y-12">
          {visibleCategories.map(renderCategorySection)}
        </div>
      </div>
    </div>
  )
}
