import { useEffect, useState } from "react"
import { X, MousePointerClick } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"

interface TranslationHintTipProps {
  visible: boolean
  onDismiss: () => void
}

export function TranslationHintTip({ visible, onDismiss }: TranslationHintTipProps) {
  const { t } = useTranslation()
  const [show, setShow] = useState(visible)

  useEffect(() => {
    setShow(visible)
  }, [visible])

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [show, onDismiss])

  if (!show) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm w-[calc(100%-2rem)]">
      <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-lg flex items-start gap-3">
        <MousePointerClick className="h-5 w-5 mt-0.5 flex-shrink-0 opacity-90" />
        <p className="text-sm font-medium leading-snug flex-1">
          {t('storyReader.translationHint')}
        </p>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
