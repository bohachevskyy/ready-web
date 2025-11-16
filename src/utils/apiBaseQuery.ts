import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store/store'
import { refreshAccessToken, clearAuth } from '../store/authSlice'

/**
 * Shared base query with automatic token refresh fallback
 * Handles authentication and token refresh for all RTK Query APIs
 */
export const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const state = api.getState() as RootState
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
        // Attempt to refresh the token
        const refreshResult = await api.dispatch(refreshAccessToken(refreshToken))

        if (refreshAccessToken.fulfilled.match(refreshResult)) {
          // Token refreshed successfully, retry the original request
          console.log('[BaseQuery] Token refreshed successfully, retrying request')

          // Get the new token
          const newState = api.getState() as RootState
          const newToken = newState.auth.token

          // Create a new base query with the new token
          const retryBaseQuery = fetchBaseQuery({
            baseUrl: 'http://localhost:8080',
            prepareHeaders: (headers) => {
              if (newToken) {
                headers.set('Authorization', `Bearer ${newToken}`)
              }
              return headers
            },
          })

          // Retry the original request
          result = await retryBaseQuery(args, api, extraOptions)
        } else {
          // Token refresh failed, clear auth state
          console.error('[BaseQuery] Token refresh failed, logging out')
          api.dispatch(clearAuth())
        }
      } catch (error) {
        // Error during refresh, clear auth state
        console.error('[BaseQuery] Error during token refresh:', error)
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
