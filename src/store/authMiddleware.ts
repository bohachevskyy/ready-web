import { Middleware } from '@reduxjs/toolkit'

/**
 * Auth middleware that can be used for monitoring auth-related actions
 * Authentication is now handled by Firebase and protected routes
 */
export const authMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  // Pass through all actions
  // Can be extended to handle auth-specific logic like:
  // - Logging auth events
  // - Refreshing tokens
  // - Clearing state on logout
  return next(action)
}
