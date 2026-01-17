/**
 * Check if token is expired
 */
export function isTokenExpired(tokenExpiresAt: string | null): boolean {
  if (!tokenExpiresAt) return true
  const expirationTime = new Date(tokenExpiresAt).getTime()
  const currentTime = Date.now()
  return currentTime >= expirationTime
}
