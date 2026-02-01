import { useTranslation } from '../../i18n/useTranslation'
import { X } from 'lucide-react'

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
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-green-900">
            {t('storyReader.completionBanner.title')}
          </p>
          {completedAt && (
            <p className="text-xs text-green-700 mt-1">
              {t('storyReader.completionBanner.completedOn')} {formatDate(completedAt)}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-green-600 hover:text-green-800 transition-colors"
        aria-label={t('storyReader.completionBanner.dismiss')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
