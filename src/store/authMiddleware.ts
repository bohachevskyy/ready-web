import { Middleware, isAction } from '@reduxjs/toolkit'
import { login } from './authSlice'

// Hardcoded credentials
const HARDCODED_EMAIL = 'alice@example.com'
const HARDCODED_PASSWORD = 'password123'

/**
 * Auth middleware that automatically handles authentication
 * - Checks if token exists before API requests
 * - Automatically logs in if no token is present
 * - Handles 401 errors by re-authenticating
 */
export const authMiddleware: Middleware = (storeAPI) => (next) => async (action) => {
  // Check if this is a valid action and a storiesApi request
  if (isAction(action) && action.type?.startsWith('storiesApi/')) {
    const state = storeAPI.getState() as any
    const token = state.auth.token

    // If no token exists, login first
    if (!token && (action.type.includes('executeQuery') || action.type.includes('executeMutation'))) {
      try {
        // Dispatch the login thunk
        await (storeAPI.dispatch as any)(login({
          email: HARDCODED_EMAIL,
          password: HARDCODED_PASSWORD,
        }))
      } catch (error) {
        console.error('Auto-login failed:', error)
      }
    }
  }

  return next(action)
}
