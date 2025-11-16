import { Middleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import { refreshAccessToken, loginWithFirebase } from './authSlice'
import type { RootState } from './store'
import {
  scheduleTokenRefresh,
  cancelTokenRefresh,
  isTokenExpired,
  getMillisecondsUntilExpiration,
} from '../utils/tokenRefreshScheduler'

/**
 * Auth middleware that handles automatic token refresh
 * - On app rehydration: checks token expiration and schedules refresh
 * - On login/refresh success: schedules automatic refresh before token expires
 */
export const authMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  // Type guard for actions with a 'type' property
  const hasType = (action: unknown): action is { type: string } => {
    return typeof action === 'object' && action !== null && 'type' in action
  }

  // Handle rehydration from localStorage
  if (hasType(action) && action.type === REHYDRATE) {
    const result = next(action)

    // After state is rehydrated, check token expiration
    const state = storeAPI.getState() as RootState
    const { refreshToken, tokenExpiresAt } = state.auth

    if (refreshToken && tokenExpiresAt) {
      // Check if token is expired or expires soon
      const FIVE_MINUTES_MS = 5 * 60 * 1000
      const msUntilExpiration = getMillisecondsUntilExpiration(tokenExpiresAt)

      if (isTokenExpired(tokenExpiresAt)) {
        // Token already expired, refresh immediately
        console.log('[AuthMiddleware] Token expired, refreshing immediately')
        storeAPI.dispatch(refreshAccessToken(refreshToken) as any)
      } else if (msUntilExpiration < FIVE_MINUTES_MS) {
        // Token expires soon, refresh immediately
        console.log('[AuthMiddleware] Token expires soon, refreshing immediately')
        storeAPI.dispatch(refreshAccessToken(refreshToken) as any)
      } else {
        // Token still valid, schedule refresh
        scheduleTokenRefresh(tokenExpiresAt, () => {
          const currentState = storeAPI.getState() as RootState
          const currentRefreshToken = currentState.auth.refreshToken
          if (currentRefreshToken) {
            storeAPI.dispatch(refreshAccessToken(currentRefreshToken) as any)
          }
        })
      }
    }

    return result
  }

  // Handle successful login - schedule token refresh
  if (hasType(action) && action.type === loginWithFirebase.fulfilled.type) {
    const result = next(action)
    const state = storeAPI.getState() as RootState
    const { tokenExpiresAt, refreshToken } = state.auth

    if (tokenExpiresAt && refreshToken) {
      scheduleTokenRefresh(tokenExpiresAt, () => {
        const currentState = storeAPI.getState() as RootState
        const currentRefreshToken = currentState.auth.refreshToken
        if (currentRefreshToken) {
          storeAPI.dispatch(refreshAccessToken(currentRefreshToken) as any)
        }
      })
    }

    return result
  }

  // Handle successful token refresh - schedule next refresh
  if (hasType(action) && action.type === refreshAccessToken.fulfilled.type) {
    const result = next(action)
    const state = storeAPI.getState() as RootState
    const { tokenExpiresAt, refreshToken } = state.auth

    if (tokenExpiresAt && refreshToken) {
      scheduleTokenRefresh(tokenExpiresAt, () => {
        const currentState = storeAPI.getState() as RootState
        const currentRefreshToken = currentState.auth.refreshToken
        if (currentRefreshToken) {
          storeAPI.dispatch(refreshAccessToken(currentRefreshToken) as any)
        }
      })
    }

    return result
  }

  // Handle logout or token refresh failure - cancel scheduled refresh
  if (
    hasType(action) &&
    (action.type === 'auth/clearAuth' || action.type === refreshAccessToken.rejected.type)
  ) {
    cancelTokenRefresh()
    return next(action)
  }

  return next(action)
}
