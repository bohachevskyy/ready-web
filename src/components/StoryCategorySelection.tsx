import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { useTranslation } from "../i18n/useTranslation"
import { useStoryCategories } from "../hooks/useStoryCategories"
import { useFavoriteDomains } from "../hooks/useFavoriteDomains"
import { useDomainSearch } from "../hooks/useDomainSearch"
import { Heart, Loader2, Search, icons } from "lucide-react"
import { OnboardingStep } from "../hooks/useOnboarding"

type StoryDomain = string

interface OnboardingControl {
  currentStep: OnboardingStep
  isActive: boolean
  isCompleted: boolean
  isDismissed: boolean
  completeCurrentStep: () => void
  skipOnboarding: () => void
  resetOnboarding: () => void
  isStepActive: (step: OnboardingStep) => boolean
}

interface StoryCategorySelectionProps {
  onSelectDomain: (domain: StoryDomain) => void
  onboarding: OnboardingControl
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

export function StoryCategorySelection({ onSelectDomain, onboarding }: StoryCategorySelectionProps) {
  const { t } = useTranslation()
  const { filteredCategories: allCategories, favoriteDomains: allFavorites, userFavoriteDomains: allUserFavorites, isLoading } = useStoryCategories()
  const { toggleFavoriteDomain, isFavorite } = useFavoriteDomains()
  const { searchQuery, setSearchQuery, filteredCategories, filteredFavoriteDomains: favoriteDomains, filteredUserFavoriteDomains: userFavoriteDomains } = useDomainSearch(allCategories, allFavorites, allUserFavorites)

  // Show fallback onboarding tooltip if user ended up here during welcome/auto-navigate steps
  const showFallbackOnboarding = onboarding.isActive && onboarding.currentStep <= OnboardingStep.AUTO_NAVIGATE

  const renderDomainCard = (domain: { id: string; name: string; title: string; description: string; icon: string }, forceFilledHeart = false) => {
    const favorite = forceFilledHeart || isFavorite(domain.id)

    return (
      <Card
        key={domain.id}
        className="relative group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
        onClick={() => onSelectDomain(domain.name)}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-1.5 text-muted-foreground transition-colors hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation()
            toggleFavoriteDomain(domain.id)
          }}
          aria-label={favorite ? `Remove ${domain.title} from favorites` : `Add ${domain.title} to favorites`}
        >
          <Heart className={`h-4 w-4 ${favorite ? 'fill-current text-red-500' : ''}`} />
        </button>
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
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('stories.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('stories.pageDescription')}</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('stories.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md bg-white border-gray-300"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-12">
            {userFavoriteDomains.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-6 w-6 fill-current text-red-500" />
                  <h2 className="text-2xl font-bold text-foreground">{t('stories.myFavorites')}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
                  {userFavoriteDomains.map((domain) => renderDomainCard(domain, true))}
                </div>
              </div>
            )}
            {favoriteDomains.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <DynamicIcon name="heart" className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">{t('stories.communityFavorites')}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
                  {favoriteDomains.map((domain) => renderDomainCard(domain))}
                </div>
              </div>
            )}
            {filteredCategories.map((category) => {
              const sortedDomains = [...category.domains].sort((a, b) => a.order - b.order)

              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <DynamicIcon name={category.icon} className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
                    {sortedDomains.map((domain) => renderDomainCard(domain))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Fallback onboarding tooltip if auto-story generation failed */}
      {showFallbackOnboarding && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md w-[calc(100%-2rem)]">
          <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-2xl border-2 border-primary-foreground/20">
            <div className="flex items-start gap-3 mb-3">
              <Search className="h-5 w-5 mt-0.5 flex-shrink-0 opacity-90" />
              <div className="flex-1">
                <h3 className="text-base font-semibold leading-snug">{t('onboarding.step0Fallback.title')}</h3>
              </div>
              <button
                onClick={onboarding.skipOnboarding}
                className="flex-shrink-0 p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="Close"
              >
                <icons.X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-95 mb-4 ml-8">
              {t('onboarding.step0Fallback.message')}
            </p>
            <div className="flex items-center justify-between gap-4 ml-8">
              <span className="text-xs opacity-75 font-medium">{t('onboarding.progress', { current: '1', total: '5' })}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onboarding.skipOnboarding}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-primary-foreground/20 transition-colors"
                >
                  {t('onboarding.skip')}
                </button>
                <button
                  onClick={onboarding.completeCurrentStep}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-foreground/90 text-primary hover:bg-primary-foreground transition-colors shadow-sm"
                >
                  {t('onboarding.next')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
