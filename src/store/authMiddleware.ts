import { Middleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import { refreshAccessToken } from './authSlice'
import type { RootState } from './store'

/**
 * Auth middleware that handles automatic token refresh on app initialization
 */
export const authMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  // Type guard for actions with a 'type' property
  const hasType = (action: unknown): action is { type: string } => {
    return typeof action === 'object' && action !== null && 'type' in action
  }

  // Handle rehydration from localStorage
  if (hasType(action) && action.type === REHYDRATE) {
    const result = next(action)

    // After state is rehydrated, check if we need to refresh the token
    const state = storeAPI.getState() as RootState
    const { refreshToken, token } = state.auth

    // If we have a refresh token but no access token (or expired), refresh it
    if (refreshToken && !token) {
      storeAPI.dispatch(refreshAccessToken(refreshToken) as any)
    }

    return result
  }

  return next(action)
}
