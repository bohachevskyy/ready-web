import { Card } from "./ui/card"
import { useTranslation } from "../i18n/useTranslation"
import { useMemo } from "react"
import { useStoryCategories, Category } from "../hooks/useStoryCategories"
import { Loader2, icons } from "lucide-react"

type StoryDomain = string

interface StoryCategorySelectionProps {
  onSelectDomain: (domain: StoryDomain) => void
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof icons
  const IconComponent = icons[pascalName]
  if (!IconComponent) return null
  return <IconComponent className={className} />
}

export function StoryCategorySelection({ onSelectDomain }: StoryCategorySelectionProps) {
  const { t } = useTranslation()
  const { visibleCategories, categories, isLoading } = useStoryCategories()
  const visibleCategoryData = useMemo(() => {
    return visibleCategories
      .map((categoryKey) => categories.find((category) => category.name === categoryKey))
      .filter((category): category is Category => Boolean(category))
      .sort((a, b) => a.order - b.order)
  }, [categories, visibleCategories])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('stories.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('stories.pageDescription')}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-12">
            {visibleCategoryData.map((category) => {
              const sortedDomains = [...category.domains].sort((a, b) => a.order - b.order)

              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <DynamicIcon name={category.icon} className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
                    {sortedDomains.map((domain) => (
                      <Card
                        key={domain.id}
                        className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                        onClick={() => onSelectDomain(domain.name)}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                            <DynamicIcon name={domain.icon} className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground text-sm leading-tight">{domain.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
