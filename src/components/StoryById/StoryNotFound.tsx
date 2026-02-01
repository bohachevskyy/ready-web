import { Button } from "../ui/button"
import { FileQuestion } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"

interface StoryNotFoundProps {
  onGoHome: () => void
}

export function StoryNotFound({ onGoHome }: StoryNotFoundProps) {
  const { t } = useTranslation()

  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="text-center px-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-muted p-6">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-4 text-foreground">
          {t('storyById.notFound.title')}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t('storyById.notFound.description')}
        </p>
        <Button onClick={onGoHome} size="lg">
          {t('storyById.notFound.goHome')}
        </Button>
      </div>
    </div>
  )
}
