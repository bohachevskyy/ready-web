import { isTokenExpired } from './tokenUtils'

describe('isTokenExpired', () => {
  it('returns true when tokenExpiresAt is null', () => {
    expect(isTokenExpired(null)).toBe(true)
  })

  it('returns true when token is expired (past date)', () => {
    const pastDate = new Date(Date.now() - 60000).toISOString()
    expect(isTokenExpired(pastDate)).toBe(true)
  })

  it('returns false when token is not expired (future date)', () => {
    const futureDate = new Date(Date.now() + 60000).toISOString()
    expect(isTokenExpired(futureDate)).toBe(false)
  })

  it('returns true when token expires exactly now', () => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(now)
    const exactNow = new Date(now).toISOString()
    expect(isTokenExpired(exactNow)).toBe(true)
    jest.restoreAllMocks()
  })
})
