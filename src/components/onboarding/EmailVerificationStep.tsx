import { Mail } from "lucide-react"
import { Button } from "../ui/button"

interface EmailVerificationStepProps {
  email: string
  onVerified: () => void
  onResendEmail: () => void
}

export function EmailVerificationStep({ email, onVerified, onResendEmail }: EmailVerificationStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Check Your Email</h2>
        <p className="text-sm text-muted-foreground mt-2">
          We sent a verification link to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">Click the link in your email to verify your account</p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">Waiting for verification...</span>
        </div>
      </div>

      <Button onClick={onVerified} variant="outline" className="w-full" size="lg">
        I've verified my email
      </Button>

      <button
        type="button"
        onClick={onResendEmail}
        className="w-full text-sm text-muted-foreground hover:text-primary"
      >
        Resend verification email
      </button>
    </div>
  )
}
