/// <reference types="jest" />

import { sendVerificationEmail, checkVerificationStatus } from './emailVerificationService'
import { fetchWithAuth } from '../utils/fetchWithAuth'

jest.mock('../utils/fetchWithAuth')

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('emailVerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendVerificationEmail', () => {
    it('should make POST request to email verification endpoint', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ message: 'Verification email sent' }),
      } as Response

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      await sendVerificationEmail()

      expect(mockFetchWithAuth).toHaveBeenCalledTimes(1)
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'http://localhost:8080/auth/email-verification',
        { method: 'POST' }
      )
    })

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      await expect(sendVerificationEmail()).rejects.toThrow('Failed to send verification email')
    })

    it('should throw error on network failure', async () => {
      mockFetchWithAuth.mockRejectedValueOnce(new Error('Network error'))

      await expect(sendVerificationEmail()).rejects.toThrow('Network error')
    })
  })

  describe('checkVerificationStatus', () => {
    it('should return true when email is verified', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ email_verified: true }),
      } as Response

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await checkVerificationStatus()

      expect(result).toBe(true)
      expect(mockFetchWithAuth).toHaveBeenCalledTimes(1)
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'http://localhost:8080/auth/email-verification'
      )
    })

    it('should return false when email is not verified', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ email_verified: false }),
      } as Response

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await checkVerificationStatus()

      expect(result).toBe(false)
    })

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({}),
      } as Response

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      await expect(checkVerificationStatus()).rejects.toThrow('Failed to check verification status')
    })

    it('should throw error on network failure', async () => {
      mockFetchWithAuth.mockRejectedValueOnce(new Error('Network error'))

      await expect(checkVerificationStatus()).rejects.toThrow('Network error')
    })
  })
})
