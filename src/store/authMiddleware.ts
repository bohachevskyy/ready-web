import { Middleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import { refreshAccessToken } from './authSlice'
import type { RootState } from './store'

/**
 * Auth middleware - simplified
 * Only handles app rehydration to refresh expired tokens on app restart
 * All other token refresh logic is handled in apiBaseQuery before each request
 */
export const authMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  // Type guard for actions with a 'type' property
  const hasType = (action: unknown): action is { type: string } => {
    return typeof action === 'object' && action !== null && 'type' in action
  }

  // Handle rehydration from localStorage
  if (hasType(action) && action.type === REHYDRATE) {
    const result = next(action)

    // After state is rehydrated, check if token is expired
    const state = storeAPI.getState() as RootState
    const { refreshToken, tokenExpiresAt } = state.auth

    if (refreshToken && tokenExpiresAt) {
      const expirationTime = new Date(tokenExpiresAt).getTime()
      const currentTime = Date.now()
      const isExpired = expirationTime <= currentTime

      if (isExpired) {
        // Token already expired, refresh immediately
        storeAPI.dispatch(refreshAccessToken(refreshToken) as any)
          .catch((error: unknown) => {
            // Network errors are handled by the reducer (sets networkError flag)
            // Don't clear auth - let user see the error banner
            console.log('[AuthMiddleware] Token refresh failed on startup:', error)
          })
      }
    }

    return result
  }

  return next(action)
}
