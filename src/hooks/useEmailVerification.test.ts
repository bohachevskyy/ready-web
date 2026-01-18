/// <reference types="jest" />

import { renderHook, act } from '@testing-library/react'
import { useEmailVerification } from './useEmailVerification'
import * as emailVerificationService from '../services/emailVerificationService'

jest.mock('../services/emailVerificationService')

describe('useEmailVerification', () => {
  let onVerified: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    onVerified = jest.fn()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  describe('startPolling', () => {
    it('should start polling verification status', () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      expect(result.current.isPolling).toBe(false)

      act(() => {
        result.current.startPolling()
      })

      expect(result.current.isPolling).toBe(true)
    })

    it('should check verification status every 2 seconds', async () => {
      const mockCheckStatus = jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      // First poll at 2 seconds
      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(mockCheckStatus).toHaveBeenCalledTimes(1)

      // Second poll at 4 seconds
      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(mockCheckStatus).toHaveBeenCalledTimes(2)
    })

    it('should show skip button after 5 seconds', async () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      expect(result.current.showSkipButton).toBe(false)

      // At 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(5000)
        await Promise.resolve()
      })

      expect(result.current.showSkipButton).toBe(true)
    })

    it('should not start polling twice if already polling', () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      expect(result.current.isPolling).toBe(true)

      act(() => {
        result.current.startPolling()
      })

      expect(result.current.isPolling).toBe(true)
    })
  })

  describe('verification success', () => {
    it('should stop polling when email is verified', async () => {
      const mockCheckStatus = jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(true)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      expect(result.current.isPolling).toBe(true)

      // Wait for first poll
      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.isVerified).toBe(true)
      expect(result.current.isPolling).toBe(false)
      expect(mockCheckStatus).toHaveBeenCalledTimes(1)
    })

    it('should auto-navigate 2 seconds after verified', async () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(true)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      // Wait for verification check
      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.isVerified).toBe(true)
      expect(onVerified).not.toHaveBeenCalled()

      // Wait for auto-navigation (2 seconds)
      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(onVerified).toHaveBeenCalledTimes(1)
    })
  })

  describe('skipVerification', () => {
    it('should call onVerified immediately when skipped', async () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      await act(async () => {
        jest.advanceTimersByTime(5000)
        await Promise.resolve()
      })

      expect(result.current.showSkipButton).toBe(true)

      act(() => {
        result.current.skipVerification()
      })

      expect(onVerified).toHaveBeenCalledTimes(1)
    })

    it('should prevent auto-navigation if user manually skipped', async () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      // Wait for skip button to appear
      await act(async () => {
        jest.advanceTimersByTime(5000)
        await Promise.resolve()
      })

      // User clicks skip
      act(() => {
        result.current.skipVerification()
      })

      expect(onVerified).toHaveBeenCalledTimes(1)

      // Advancing time shouldn't trigger auto-navigation
      await act(async () => {
        jest.advanceTimersByTime(10000)
        await Promise.resolve()
      })

      expect(onVerified).toHaveBeenCalledTimes(1)
    })
  })

  describe('resendEmail', () => {
    it('should call sendVerificationEmail service', async () => {
      const mockSend = jest.spyOn(emailVerificationService, 'sendVerificationEmail')
        .mockResolvedValue()

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      expect(result.current.isSending).toBe(false)

      await act(async () => {
        await result.current.resendEmail()
      })

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.current.isSending).toBe(false)
    })

    it('should handle errors when resending email', async () => {
      jest.spyOn(emailVerificationService, 'sendVerificationEmail')
        .mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      await act(async () => {
        await result.current.resendEmail()
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.isSending).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle errors when checking verification status', async () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.isPolling).toBe(false)
    })

    it('should stop polling when error occurs', async () => {
      const mockCheckStatus = jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.error).toBe('Network error')
      expect(mockCheckStatus).toHaveBeenCalledTimes(1)

      // Verify polling stopped
      await act(async () => {
        jest.advanceTimersByTime(10000)
        await Promise.resolve()
      })

      expect(mockCheckStatus).toHaveBeenCalledTimes(1)
    })

    it('should clear error when starting new polling', async () => {
      jest.spyOn(emailVerificationService, 'sendVerificationEmail')
        .mockRejectedValue(new Error('Network error'))

      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      // Set error via resendEmail
      await act(async () => {
        await result.current.resendEmail()
      })

      expect(result.current.error).toBe('Network error')

      // Start polling should clear error
      act(() => {
        result.current.startPolling()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('cleanup', () => {
    it('should clear all timers on unmount', async () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(false)

      const { result, unmount } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      expect(result.current.isPolling).toBe(true)

      unmount()

      // Verify no errors when advancing timers after unmount
      await act(async () => {
        jest.advanceTimersByTime(10000)
        await Promise.resolve()
      })
    })

    it('should clear timers when verification succeeds', async () => {
      jest.spyOn(emailVerificationService, 'checkVerificationStatus')
        .mockResolvedValue(true)

      const { result } = renderHook(() => useEmailVerification({ onVerified }))

      act(() => {
        result.current.startPolling()
      })

      // Wait for verification
      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.isVerified).toBe(true)

      // Advancing timers should not cause any issues
      await act(async () => {
        jest.advanceTimersByTime(10000)
        await Promise.resolve()
      })
    })
  })
})
