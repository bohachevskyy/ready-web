import { useTranslation } from "../i18n/useTranslation"
import { useStoryCategories } from "../hooks/useStoryCategories"
import { useFavoriteDomains } from "../hooks/useFavoriteDomains"
import { useDomainSearch } from "../hooks/useDomainSearch"
import { logEvent } from "../services/analyticsService"
import { Heart, Loader2, Search, icons } from "lucide-react"
import { OnboardingStep } from "../hooks/useOnboarding"
import { DuoCard } from "./ui/duo-card"
import { cn } from "../lib/utils"

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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof icons
  const IconComponent = icons[pascalName]
  if (!IconComponent) return null
  return <IconComponent className={className} />
}

interface DomainData {
  id: string
  name: string
  title: string
  description: string
  icon: string
}

export function StoryCategorySelection({ onSelectDomain, onboarding }: StoryCategorySelectionProps) {
  const { t } = useTranslation()
  const {
    filteredCategories: allCategories,
    favoriteDomains: allFavorites,
    userFavoriteDomains: allUserFavorites,
    isLoading,
  } = useStoryCategories()
  const { toggleFavoriteDomain, isFavorite } = useFavoriteDomains()
  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    filteredFavoriteDomains: favoriteDomains,
    filteredUserFavoriteDomains: userFavoriteDomains,
  } = useDomainSearch(allCategories, allFavorites, allUserFavorites)

  const showFallbackOnboarding =
    onboarding.isActive && onboarding.currentStep <= OnboardingStep.AUTO_NAVIGATE

  const renderDomainCard = (domain: DomainData, forceFilledHeart = false) => {
    const favorite = forceFilledHeart || isFavorite(domain.id)
    return (
      <DuoCard
        key={domain.id}
        className={cn(
          "p-5 text-center relative cursor-pointer w-full",
          "transition-[transform,box-shadow] duration-100",
          "hover:-translate-y-[1px]",
          "active:translate-y-[3px] active:shadow-[0_1px_0_hsl(var(--line-2))]",
        )}
        onClick={() => {
          logEvent('domain_selected', { domain_slug: domain.name })
          onSelectDomain(domain.name)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            logEvent('domain_selected', { domain_slug: domain.name })
            onSelectDomain(domain.name)
          }
        }}
      >
        <button
          type="button"
          className={cn(
            "absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-paper border-2 border-line",
            "grid place-items-center cursor-pointer transition-colors",
            favorite ? "text-heart" : "text-ink-mute hover:text-heart",
          )}
          onClick={(e) => {
            e.stopPropagation()
            toggleFavoriteDomain(domain.id)
          }}
          aria-label={
            favorite
              ? `Remove ${domain.title} from favorites`
              : `Add ${domain.title} to favorites`
          }
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-green-soft text-green mx-auto mb-3.5 grid place-items-center">
          <DynamicIcon name={domain.icon} className="h-8 w-8" />
        </div>
        <div className="text-[15px] font-black leading-tight">{domain.title}</div>
        <div
          className="text-ink-mute text-xs font-semibold mt-1.5 leading-[1.4]"
          style={{ textWrap: 'pretty' as any }}
        >
          {domain.description}
        </div>
      </DuoCard>
    )
  }

  return (
    <div className="bg-cream py-10 px-8 pb-20 min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1200px] anim-slide">
        <h1 className="font-black text-[36px] m-0 mb-1.5 leading-[1] tracking-tight">
          {t('stories.pageTitle')}
        </h1>
        <p className="text-ink-mute text-[15px] m-0 mb-7">{t('stories.pageDescription')}</p>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-paper border-2 border-line rounded-[12px] px-3.5 max-w-[380px] mb-8">
          <Search className="h-[18px] w-[18px] text-ink-mute" />
          <input
            type="text"
            placeholder={t('stories.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 outline-none bg-transparent text-[15px] font-semibold py-3 placeholder:text-ink-mute"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-green" />
          </div>
        ) : (
          <div className="space-y-10">
            {userFavoriteDomains.length > 0 && (
              <Section
                title={t('stories.myFavorites')}
                icon={<Heart className="h-[22px] w-[22px] fill-current text-heart" />}
              >
                {userFavoriteDomains.map((domain) => renderDomainCard(domain, true))}
              </Section>
            )}
            {favoriteDomains.length > 0 && (
              <Section
                title={t('stories.communityFavorites')}
                icon={
                  <Heart className="h-[22px] w-[22px] text-green" strokeWidth={2.2} />
                }
              >
                {favoriteDomains.map((domain) => renderDomainCard(domain))}
              </Section>
            )}
            {filteredCategories.map((category) => {
              const sortedDomains = [...category.domains].sort((a, b) => a.order - b.order)
              return (
                <Section
                  key={category.id}
                  title={category.title}
                  icon={<DynamicIcon name={category.icon} className="h-[22px] w-[22px] text-green" />}
                >
                  {sortedDomains.map((domain) => renderDomainCard(domain))}
                </Section>
              )
            })}
          </div>
        )}
      </div>

      {showFallbackOnboarding && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] anim-bounce max-w-md w-[calc(100%-2rem)]">
          <div className="bg-green text-white rounded-[22px] px-5 py-4 shadow-2xl border-2 border-white/20">
            <div className="flex items-start gap-3 mb-3">
              <Search className="h-5 w-5 mt-0.5 flex-shrink-0 opacity-90" />
              <div className="flex-1">
                <h3 className="text-base font-black leading-snug">
                  {t('onboarding.step0Fallback.title')}
                </h3>
              </div>
              <button
                onClick={onboarding.skipOnboarding}
                className="flex-shrink-0 p-0.5 rounded-full hover:bg-white/20 transition-colors text-white"
                aria-label="Close"
              >
                <icons.X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-semibold leading-relaxed opacity-95 mb-4 ml-8">
              {t('onboarding.step0Fallback.message')}
            </p>
            <div className="flex items-center justify-between gap-4 ml-8">
              <span className="text-xs opacity-80 font-bold">
                {t('onboarding.progress', { current: '1', total: '5' })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onboarding.skipOnboarding}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-white/20 transition-colors"
                >
                  {t('onboarding.skip')}
                </button>
                <button
                  onClick={onboarding.completeCurrentStep}
                  className="px-4 py-1.5 text-xs font-black rounded-lg bg-white text-green-ink hover:brightness-95 transition shadow-sm"
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

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-[22px] font-black m-0 mb-4 flex items-center gap-2.5">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div>
    </section>
  )
}
