import { Mail, CheckCircle2 } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "../../i18n/useTranslation"
import { useEmailVerification } from "../../hooks/useEmailVerification"

interface EmailVerificationStepProps {
  email: string
  onVerified: () => void
}

export function EmailVerificationStep({ email, onVerified }: EmailVerificationStepProps) {
  const { t } = useTranslation()
  const {
    isVerified,
    showSkipButton,
    isSending,
    error,
    resendEmail,
    skipVerification,
  } = useEmailVerification({ onVerified })

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {isVerified ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <Mail className="h-8 w-8 text-primary" />
          )}
        </div>
        <h2 className="text-xl font-semibold">
          {isVerified ? t('onboarding.emailVerification.verified') : t('onboarding.emailVerification.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {isVerified ? (
            t('onboarding.emailVerification.verifiedMessage')
          ) : (
            <>
              {t('onboarding.emailVerification.messageSent')}
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </>
          )}
        </p>
      </div>

      {!isVerified && (
        <>
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">{t('onboarding.emailVerification.clickLink')}</p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium">
                {t('onboarding.emailVerification.checkingStatus')}
              </span>
            </div>
          </div>

          {showSkipButton && (
            <Button
              onClick={skipVerification}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              {t('onboarding.emailVerification.skip')}
            </Button>
          )}

          <button
            type="button"
            onClick={resendEmail}
            disabled={isSending}
            className="w-full text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            {isSending
              ? t('onboarding.emailVerification.sending')
              : t('onboarding.emailVerification.resendEmail')}
          </button>

          {error && (
            <div className="text-sm text-destructive text-center">
              {error}
            </div>
          )}
        </>
      )}

      {isVerified && (
        <div className="text-center text-sm text-muted-foreground">
          {t('onboarding.emailVerification.redirecting')}
        </div>
      )}
    </div>
  )
}
