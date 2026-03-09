import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { ThumbsUp, ThumbsDown, BookOpen, ArrowRight } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"

interface StoryCompletionViewProps {
  wordCount: number
  likeStatus: "like" | "dislike" | null
  onLikeFeedback: (status: "like" | "dislike") => void
  onNextStory: () => void
  onSeeMoreCategories: () => void
  isSubmitting: boolean
}

export function StoryCompletionView({
  wordCount,
  likeStatus,
  onLikeFeedback,
  onNextStory,
  onSeeMoreCategories,
  isSubmitting,
}: StoryCompletionViewProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* Words added banner */}
      <Card className="p-6 bg-green-500/10 border-green-500/30">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-green-600" />
          <p className="text-lg font-medium text-green-700">
            {t('storyReader.completion.wordsAdded', { count: wordCount })}
          </p>
        </div>
      </Card>

      {/* Like/Dislike feedback */}
      <div className="text-center space-y-4">
        <p className="text-lg text-foreground font-medium">
          {t('storyReader.completion.feedbackQuestion')}
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onLikeFeedback("like")}
            className={`gap-2 ${
              likeStatus === "like"
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground"
                : ""
            }`}
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onLikeFeedback("dislike")}
            className={`gap-2 ${
              likeStatus === "dislike"
                ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive hover:text-destructive-foreground"
                : ""
            }`}
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <Button
          onClick={onSeeMoreCategories}
          disabled={isSubmitting}
          variant="secondary"
          className="text-muted-foreground"
        >
          {t('storyReader.completion.seeMoreCategories')}
        </Button>
        <Button
          onClick={onNextStory}
          disabled={isSubmitting}
          className="px-14 py-3 text-base font-bold h-auto gap-2"
        >
          {t('storyReader.completion.nextStory')}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
