import { Button } from "../ui/button"
import { X, UserPlus } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"

interface PublicWordDrawerProps {
  isOpen: boolean
  selectedWord: string | null
  onClose: () => void
  onSignup: () => void
}

export function PublicWordDrawer({
  isOpen,
  selectedWord,
  onClose,
  onSignup,
}: PublicWordDrawerProps) {
  const { t } = useTranslation()

  if (!isOpen || !selectedWord) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 max-h-[60vh] overflow-auto animate-in slide-in-from-bottom duration-300 shadow-2xl lg:left-1/2 lg:-translate-x-1/2 lg:max-w-md">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-card px-5 py-3 flex items-center justify-between border-b border-border/50">
          <h3 className="font-semibold text-xl text-foreground">{selectedWord}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-5 pb-6 pt-4 space-y-5">
          {/* Signup CTA message */}
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <p className="text-base text-foreground/90 leading-relaxed px-2">
              {t('publicStory.signupToSeeTranslation')}
            </p>
          </div>

          {/* Signup button */}
          <Button
            className="w-full gap-2 rounded-lg"
            onClick={onSignup}
            size="lg"
          >
            <UserPlus className="h-5 w-5" />
            {t('publicStory.signUpNow')}
          </Button>
        </div>
      </div>
    </>
  )
}
