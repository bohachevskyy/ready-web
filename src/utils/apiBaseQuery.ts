import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store/store'
import { refreshAccessToken, clearAuth } from '../store/authSlice'

// Track ongoing refresh to prevent concurrent refresh attempts
let refreshPromise: Promise<any> | null = null

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
 * Shared base query with automatic token refresh
 * Checks token validity before EVERY request and refreshes if needed
 */
export const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let state = api.getState() as RootState
  const { tokenExpiresAt, refreshToken } = state.auth

  // CHECK 1: Before making the request, check if token is expired or expiring soon
  if (isTokenExpiringSoon(tokenExpiresAt)) {

    if (refreshToken) {
      try {
        // If there's already a refresh in progress, wait for it
        if (!refreshPromise) {
          refreshPromise = api.dispatch(refreshAccessToken(refreshToken)).unwrap()
            .finally(() => {
              refreshPromise = null
            })
        }

        // Wait for the refresh to complete
        await refreshPromise
      } catch (error) {
        api.dispatch(clearAuth())
        return {
          error: {
            status: 401,
            statusText: 'Unauthorized',
            data: 'Token refresh failed'
          }
        }
      }
    } else {
      api.dispatch(clearAuth())
      return {
        error: {
          status: 401,
          statusText: 'Unauthorized',
          data: 'No refresh token'
        }
      }
    }
  }

  // Get the current token after potential refresh
  state = api.getState() as RootState
  const token = state.auth.token

  // Create base query with token from Redux state
  const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  })

  // Execute the actual request
  let result = await baseQuery(args, api, extraOptions)

  // Handle 401 Unauthorized errors (fallback for edge cases)
  if (result.error && result.error.status === 401) {
    console.log('[BaseQuery] Received 401 error, attempting token refresh')

    // Try to refresh the token
    const currentState = api.getState() as RootState
    const refreshToken = currentState.auth.refreshToken

    if (refreshToken) {
      try {
        // If there's already a refresh in progress, wait for it
        if (!refreshPromise) {
          console.log('[BaseQuery] Starting new token refresh')
          refreshPromise = api.dispatch(refreshAccessToken(refreshToken)).unwrap()
            .finally(() => {
              // Clear the promise when done (success or failure)
              refreshPromise = null
            })
        } else {
          console.log('[BaseQuery] Waiting for ongoing token refresh')
        }

        // Wait for the refresh to complete
        await refreshPromise

        // Token refreshed successfully, retry the original request
        console.log('[BaseQuery] Token refreshed successfully, retrying request')

        // Get the new token
        const newState = api.getState() as RootState
        const newToken = newState.auth.token

        if (newToken) {
          // Create a new base query with the new token
          const retryBaseQuery = fetchBaseQuery({
            baseUrl: 'http://localhost:8080',
            prepareHeaders: (headers) => {
              headers.set('Authorization', `Bearer ${newToken}`)
              return headers
            },
          })

          // Retry the original request
          result = await retryBaseQuery(args, api, extraOptions)
        } else {
          // No new token available after refresh
          console.error('[BaseQuery] No token available after refresh, logging out')
          api.dispatch(clearAuth())
        }
      } catch (error) {
        // Token refresh failed, clear auth state
        console.error('[BaseQuery] Token refresh failed, logging out:', error)
        api.dispatch(clearAuth())
      }
    } else {
      // No refresh token available, clear auth state
      console.error('[BaseQuery] No refresh token available, logging out')
      api.dispatch(clearAuth())
    }
  }

  return result
}
