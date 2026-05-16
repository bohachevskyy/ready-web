import { useTranslation } from '../../i18n/useTranslation'
import { X, CheckCircle2 } from 'lucide-react'

interface CompletionBannerProps {
  completedAt: string | null
  onDismiss: () => void
}

export function CompletionBanner({ completedAt, onDismiss }: CompletionBannerProps) {
  const { t } = useTranslation()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return ''
    }
  }

  return (
    <div className="mb-4 p-4 bg-green-soft border-2 border-[#BBE3A0] rounded-[14px] flex items-start justify-between">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-ink mt-0.5" strokeWidth={2.5} />
        <div>
          <p className="text-sm font-black text-green-ink">
            {t('storyReader.completionBanner.title')}
          </p>
          {completedAt && (
            <p className="text-xs text-green-ink/80 mt-1 font-semibold">
              {t('storyReader.completionBanner.completedOn')} {formatDate(completedAt)}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-green-ink hover:text-green-deep transition-colors bg-transparent border-0 cursor-pointer"
        aria-label={t('storyReader.completionBanner.dismiss')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
