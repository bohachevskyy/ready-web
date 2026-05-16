import { Mail, CheckCircle2 } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"
import { useEmailVerification } from "../../hooks/useEmailVerification"
import { DuoButton } from "../ui/duo-button"

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
    <div className="text-center">
      <div
        className="w-24 h-24 rounded-full bg-green-soft text-green grid place-items-center mx-auto mb-5 anim-float"
      >
        {isVerified ? (
          <CheckCircle2 className="h-11 w-11" strokeWidth={2} />
        ) : (
          <Mail className="h-11 w-11" strokeWidth={2} />
        )}
      </div>

      <h2 className="font-black text-[28px] m-0 mb-2">
        {isVerified
          ? t("onboarding.emailVerification.verified")
          : t("onboarding.emailVerification.title")}
      </h2>

      <div className="text-ink-mute text-[15px]">
        {isVerified
          ? t("onboarding.emailVerification.verifiedMessage")
          : t("onboarding.emailVerification.messageSent")}
      </div>
      {!isVerified && <div className="text-[15px] font-black mt-1">{email}</div>}

      {!isVerified && (
        <>
          <div className="mt-6 px-6 py-5 bg-[#FAF6E8] border-2 border-dashed border-line-2 rounded-[14px]">
            <div className="text-ink-soft text-sm font-semibold">
              {t("onboarding.emailVerification.clickLink")}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-green font-black text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-green anim-pulse-ring" />
              {t("onboarding.emailVerification.checkingStatus")}
            </div>
          </div>

          <button
            type="button"
            onClick={resendEmail}
            disabled={isSending}
            className="mt-4 bg-transparent border-0 text-brand-blue-deep cursor-pointer text-sm font-bold px-2 py-1 disabled:opacity-50"
          >
            {isSending
              ? t("onboarding.emailVerification.sending")
              : t("onboarding.emailVerification.resendEmail")}
          </button>

          {showSkipButton && (
            <div className="mt-1.5">
              <DuoButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={skipVerification}
                className="text-xs"
              >
                {t("onboarding.emailVerification.skip")} →
              </DuoButton>
            </div>
          )}

          {error && <div className="text-sm text-heart-deep text-center mt-3">{error}</div>}
        </>
      )}

      {isVerified && (
        <div className="text-center text-sm text-ink-mute mt-3">
          {t("onboarding.emailVerification.redirecting")}
        </div>
      )}
    </div>
  )
}
