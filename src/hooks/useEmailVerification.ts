import { useState, useEffect, useRef, useCallback } from 'react'
import { checkVerificationStatus, sendVerificationEmail } from '../services/emailVerificationService'

export interface UseEmailVerificationProps {
  onVerified: () => void
}

export interface UseEmailVerificationReturn {
  isPolling: boolean
  isVerified: boolean
  showSkipButton: boolean
  isSending: boolean
  error: string | null
  startPolling: () => void
  resendEmail: () => Promise<void>
  skipVerification: () => void
}

export function useEmailVerification({ onVerified }: UseEmailVerificationProps): UseEmailVerificationReturn {
  const [isPolling, setIsPolling] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showSkipButton, setShowSkipButton] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoNavTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasManuallyNavigatedRef = useRef(false)

  // Cleanup function to clear all timers
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (skipTimerRef.current) {
      clearTimeout(skipTimerRef.current)
      skipTimerRef.current = null
    }
    if (autoNavTimerRef.current) {
      clearTimeout(autoNavTimerRef.current)
      autoNavTimerRef.current = null
    }
  }, [])

  // Poll verification status
  const pollStatus = useCallback(async () => {
    try {
      const verified = await checkVerificationStatus()
      if (verified) {
        setIsVerified(true)
        setIsPolling(false)
        cleanup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check verification status')
      setIsPolling(false)
      cleanup()
    }
  }, [cleanup])

  // Start polling when user clicks "I have verified email"
  const startPolling = useCallback(() => {
    if (isPolling) return

    setIsPolling(true)
    setError(null)
    hasManuallyNavigatedRef.current = false

    // Start polling every 2 seconds
    pollingIntervalRef.current = setInterval(pollStatus, 2000)

    // Show skip button after 5 seconds
    skipTimerRef.current = setTimeout(() => {
      setShowSkipButton(true)
    }, 5000)
  }, [isPolling, pollStatus])

  // Resend verification email
  const resendEmail = useCallback(async () => {
    setIsSending(true)
    setError(null)
    try {
      await sendVerificationEmail()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email')
    } finally {
      setIsSending(false)
    }
  }, [])

  // Skip verification
  const skipVerification = useCallback(() => {
    hasManuallyNavigatedRef.current = true
    cleanup()
    onVerified()
  }, [cleanup, onVerified])

  // Auto-navigate after 2 seconds when verified
  useEffect(() => {
    if (isVerified && !hasManuallyNavigatedRef.current) {
      autoNavTimerRef.current = setTimeout(() => {
        onVerified()
      }, 2000)
    }

    return cleanup
  }, [isVerified, onVerified, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    isPolling,
    isVerified,
    showSkipButton,
    isSending,
    error,
    startPolling,
    resendEmail,
    skipVerification,
  }
}
