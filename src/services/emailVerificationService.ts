import { fetchWithAuth } from '../utils/fetchWithAuth'
import { API_BASE_URL } from '../config/api'

export interface EmailVerificationStatusResponse {
  email_verified: boolean
}

/**
 * Send verification email to user
 * Requires Bearer token
 */
export async function sendVerificationEmail(): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/auth/email-verification`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to send verification email')
  }
}

/**
 * Check email verification status
 * Requires Bearer token
 */
export async function checkVerificationStatus(): Promise<boolean> {
  const response = await fetchWithAuth(`${API_BASE_URL}/auth/email-verification`)

  if (!response.ok) {
    throw new Error('Failed to check verification status')
  }

  const data: EmailVerificationStatusResponse = await response.json()
  return data.email_verified
}
