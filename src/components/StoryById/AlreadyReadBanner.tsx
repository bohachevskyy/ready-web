import { Info } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"

export function AlreadyReadBanner() {
  const { t } = useTranslation()

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          {t('storyById.alreadyRead.title')}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          {t('storyById.alreadyRead.description')}
        </p>
      </div>
    </div>
  )
}
