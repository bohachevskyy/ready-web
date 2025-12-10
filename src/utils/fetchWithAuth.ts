import { store } from '../store/store'
import { refreshAccessToken } from '../store/authSlice'

/**
 * Check if token is expired or will expire soon
 */
function isTokenExpiringSoon(tokenExpiresAt: string | null): boolean {
  if (!tokenExpiresAt) return true

  const expirationTime = new Date(tokenExpiresAt).getTime()
  const currentTime = Date.now()
  const FIVE_SECONDS_MS = 5 * 1000

  // Token is expired or will expire in the next 5 seconds
  return (expirationTime - currentTime) <= FIVE_SECONDS_MS
}

/**
 * Authenticated fetch wrapper that automatically refreshes tokens
 * Checks token validity before EVERY request and refreshes if needed
 *
 * @param input - URL or Request object
 * @param init - Fetch options (headers, method, body, etc.)
 * @returns Promise<Response>
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Get current auth state
  let state = store.getState()
  const { tokenExpiresAt, refreshToken } = state.auth

  // Check if token is expired or expiring soon before making request
  if (isTokenExpiringSoon(tokenExpiresAt)) {
    if (refreshToken) {
      try {
        // Refresh the token using Redux Thunk
        await store.dispatch(refreshAccessToken(refreshToken)).unwrap()

        // Get updated state with new token
        state = store.getState()
      } catch (error) {
        throw new Error('Token refresh failed')
      }
    } else {
      throw new Error('No refresh token available')
    }
  }

  // Get the current (possibly refreshed) token
  const currentToken = state.auth.token

  // Prepare headers with Authorization
  const headers = new Headers(init?.headers)
  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`)
  }

  // Make the actual fetch request with the token
  return fetch(input, {
    ...init,
    headers,
  })
}
