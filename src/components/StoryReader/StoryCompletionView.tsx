import { ThumbsUp, ThumbsDown, BookOpen, ArrowRight } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"
import { DuoButton } from "../ui/duo-button"
import { DuoCard } from "../ui/duo-card"
import { cn } from "../../lib/utils"

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
    <div className="space-y-8 anim-bounce">
      {/* Words added banner */}
      <DuoCard className="p-6 bg-green-soft border-[#BBE3A0]">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-green-ink" strokeWidth={2.2} />
          <p className="text-lg font-black text-green-ink">
            {t('storyReader.completion.wordsAdded', { count: wordCount })}
          </p>
        </div>
      </DuoCard>

      {/* Like/Dislike feedback */}
      <div className="text-center space-y-4">
        <p className="text-lg text-ink font-extrabold">
          {t('storyReader.completion.feedbackQuestion')}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onLikeFeedback("like")}
            className={cn(
              "w-14 h-14 rounded-full grid place-items-center cursor-pointer transition-[transform,box-shadow] duration-100 border-2",
              likeStatus === "like"
                ? "bg-green text-white border-green-deep shadow-[0_4px_0_hsl(var(--green-deep))]"
                : "bg-paper text-ink border-line shadow-[0_4px_0_hsl(var(--line-2))] hover:brightness-105",
            )}
            aria-label="Like"
          >
            <ThumbsUp className="h-5 w-5" />
          </button>
          <button
            onClick={() => onLikeFeedback("dislike")}
            className={cn(
              "w-14 h-14 rounded-full grid place-items-center cursor-pointer transition-[transform,box-shadow] duration-100 border-2",
              likeStatus === "dislike"
                ? "bg-heart text-white border-heart-deep shadow-[0_4px_0_hsl(var(--heart-deep))]"
                : "bg-paper text-ink border-line shadow-[0_4px_0_hsl(var(--line-2))] hover:brightness-105",
            )}
            aria-label="Dislike"
          >
            <ThumbsDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <DuoButton
          onClick={onSeeMoreCategories}
          disabled={isSubmitting}
          variant="secondary"
        >
          {t('storyReader.completion.seeMoreCategories')}
        </DuoButton>
        <DuoButton
          onClick={onNextStory}
          disabled={isSubmitting}
          size="lg"
        >
          {t('storyReader.completion.nextStory')}
          <ArrowRight className="h-5 w-5" />
        </DuoButton>
      </div>
    </div>
  )
}
