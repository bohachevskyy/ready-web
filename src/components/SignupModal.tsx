import { useState, useCallback } from 'react'
import { Card } from './ui/card'
import { AuthForm } from './AuthForm'
import { OnboardingForm } from './OnboardingForm'

interface SignupModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export function SignupModal({ open, onClose, onComplete }: SignupModalProps) {
  const [step, setStep] = useState<'auth' | 'onboarding'>('auth')

  const handleAuthSuccess = useCallback(() => {
    setStep('onboarding')
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    setStep('auth')
    onComplete()
  }, [onComplete])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={handleOverlayClick}
    >
      <Card
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-8 bg-card shadow-lg max-h-[90vh] overflow-y-auto"
      >
        {step === 'auth' && (
          <AuthForm onSuccess={handleAuthSuccess} />
        )}

        {step === 'onboarding' && (
          <OnboardingForm onComplete={handleOnboardingComplete} />
        )}
      </Card>
    </div>
  )
}
