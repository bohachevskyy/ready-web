import { DuoButton } from "../ui/duo-button"
import { useTranslation } from "../../i18n/useTranslation"

interface StoryBottomBarProps {
  onSkip: () => void
  onComplete: () => void
  isSubmitting: boolean
}

export function StoryBottomBar({ onSkip, onComplete, isSubmitting }: StoryBottomBarProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:right-80 z-30 bg-paper border-t-2 border-line px-6 py-3.5">
      <div className="max-w-[700px] mx-auto flex items-center justify-end gap-3">
        <DuoButton
          variant="secondary"
          onClick={onSkip}
          disabled={isSubmitting}
        >
          {t('storyReader.skip')}
        </DuoButton>
        <DuoButton
          onClick={onComplete}
          disabled={isSubmitting}
        >
          {t('storyReader.complete')}
        </DuoButton>
      </div>
    </div>
  )
}
