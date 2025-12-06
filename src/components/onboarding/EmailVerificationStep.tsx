import { Mail } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "../../i18n/useTranslation"

interface EmailVerificationStepProps {
  email: string
  onVerified: () => void
  onResendEmail: () => void
}

export function EmailVerificationStep({ email, onVerified, onResendEmail }: EmailVerificationStepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t('onboarding.emailVerification.title')}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t('onboarding.emailVerification.messageSent')}
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">{t('onboarding.emailVerification.clickLink')}</p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">{t('onboarding.emailVerification.waitingForVerification')}</span>
        </div>
      </div>

      <Button onClick={onVerified} variant="outline" className="w-full" size="lg">
        {t('onboarding.emailVerification.verifiedButton')}
      </Button>

      <button
        type="button"
        onClick={onResendEmail}
        className="w-full text-sm text-muted-foreground hover:text-primary"
      >
        {t('onboarding.emailVerification.resendEmail')}
      </button>
    </div>
  )
}
