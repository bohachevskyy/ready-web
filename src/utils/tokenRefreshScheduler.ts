/**
 * Token Refresh Scheduler
 * Manages automatic token refresh before expiration
 */

let refreshTimerId: NodeJS.Timeout | null = null

/**
 * Calculate milliseconds until a specific time
 * @param expiresAt ISO 8601 timestamp string
 * @returns milliseconds until expiration, or 0 if already expired
 */
export function getMillisecondsUntilExpiration(expiresAt: string): number {
  const expirationTime = new Date(expiresAt).getTime()
  const currentTime = Date.now()
  const msUntilExpiration = expirationTime - currentTime

  return Math.max(0, msUntilExpiration)
}

/**
 * Calculate when to trigger token refresh (at 80% of token lifetime)
 * @param expiresAt ISO 8601 timestamp string
 * @returns milliseconds until refresh should be triggered
 */
export function calculateRefreshTime(expiresAt: string): number {
  const msUntilExpiration = getMillisecondsUntilExpiration(expiresAt)

  // Refresh at 80% of the token lifetime
  // e.g., if token expires in 60 minutes, refresh at 48 minutes
  const refreshAt = msUntilExpiration * 0.8

  // If token expires very soon (less than 5 minutes), refresh immediately
  const FIVE_MINUTES_MS = 5 * 60 * 1000
  if (msUntilExpiration < FIVE_MINUTES_MS) {
    return 0 // Trigger immediate refresh
  }

  return refreshAt
}

/**
 * Schedule automatic token refresh
 * @param expiresAt ISO 8601 timestamp when token expires
 * @param refreshCallback Function to call when refresh should happen
 */
export function scheduleTokenRefresh(
  expiresAt: string,
  refreshCallback: () => void
): void {
  // Cancel any existing refresh timer
  cancelTokenRefresh()

  const msUntilRefresh = calculateRefreshTime(expiresAt)

  if (msUntilRefresh === 0) {
    // Token expires very soon or already expired, refresh immediately
    console.log('[TokenRefreshScheduler] Token expires soon, refreshing immediately')
    refreshCallback()
    return
  }

  // Schedule refresh
  const refreshDate = new Date(Date.now() + msUntilRefresh)
  console.log(
    `[TokenRefreshScheduler] Scheduled token refresh at ${refreshDate.toISOString()} ` +
    `(in ${Math.round(msUntilRefresh / 1000 / 60)} minutes)`
  )

  refreshTimerId = setTimeout(() => {
    console.log('[TokenRefreshScheduler] Triggering scheduled token refresh')
    refreshCallback()
  }, msUntilRefresh)
}

/**
 * Cancel any scheduled token refresh
 */
export function cancelTokenRefresh(): void {
  if (refreshTimerId !== null) {
    clearTimeout(refreshTimerId)
    refreshTimerId = null
    console.log('[TokenRefreshScheduler] Cancelled scheduled token refresh')
  }
}

/**
 * Check if token is expired
 * @param expiresAt ISO 8601 timestamp string
 * @returns true if token is expired
 */
export function isTokenExpired(expiresAt: string): boolean {
  return getMillisecondsUntilExpiration(expiresAt) === 0
}
