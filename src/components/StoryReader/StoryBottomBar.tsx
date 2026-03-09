import { Button } from "../ui/button"
import { useTranslation } from "../../i18n/useTranslation"

interface StoryBottomBarProps {
  onSkip: () => void
  onComplete: () => void
  isSubmitting: boolean
}

export function StoryBottomBar({ onSkip, onComplete, isSubmitting }: StoryBottomBarProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:right-80 z-30 bg-background/95 backdrop-blur-sm border-t border-border/40 px-6 py-4">
      <div className="max-w-prose mx-auto flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={onSkip}
          disabled={isSubmitting}
          className="text-muted-foreground"
        >
          {t('storyReader.skip')}
        </Button>
        <Button
          variant="default"
          onClick={onComplete}
          disabled={isSubmitting}
          className="px-12 py-3 text-base font-bold h-auto"
        >
          {t('storyReader.complete')}
        </Button>
      </div>
    </div>
  )
}
