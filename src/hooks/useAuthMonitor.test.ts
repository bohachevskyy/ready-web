import { act, renderHook } from '@testing-library/react'

// Mock modules
const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
let mockAuthState = {
  token: 'valid-token',
  tokenExpiresAt: new Date(Date.now() + 60000).toISOString(),
  refreshToken: 'refresh-token',
}

jest.mock('react-router-dom')
jest.mock('../store/store', () => ({
  useAppSelector: (selector: (state: { auth: typeof mockAuthState }) => typeof mockAuthState) =>
    selector({ auth: mockAuthState }),
  useAppDispatch: () => mockDispatch,
}))
jest.mock('../store/authSlice', () => ({
  clearAuth: () => ({ type: 'auth/clearAuth' }),
  refreshAccessToken: (token: string) => ({ type: 'auth/refreshToken', payload: token }),
}))

import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthMonitor } from './useAuthMonitor'

const mockUseNavigate = useNavigate as jest.Mock
const mockUseLocation = useLocation as jest.Mock

describe('useAuthMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' })
    mockAuthState = {
      token: 'valid-token',
      tokenExpiresAt: new Date(Date.now() + 60000).toISOString(),
      refreshToken: 'refresh-token',
    }
  })

  describe('cross-tab logout detection', () => {
    it('dispatches clearAuth when logout-event is detected', () => {
      renderHook(() => useAuthMonitor())

      act(() => {
        const storageEvent = new StorageEvent('storage', { key: 'logout-event' })
        window.dispatchEvent(storageEvent)
      })

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' })
    })

    it('dispatches clearAuth when persist:auth is cleared', () => {
      renderHook(() => useAuthMonitor())

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'persist:auth',
          newValue: null,
        })
        window.dispatchEvent(storageEvent)
      })

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' })
    })

    it('does not dispatch clearAuth for unrelated storage events', () => {
      renderHook(() => useAuthMonitor())

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'some-other-key',
          newValue: 'some-value',
        })
        window.dispatchEvent(storageEvent)
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('visibility change token expiration', () => {
    it('refreshes token when tab becomes visible and token is expired', () => {
      mockAuthState = {
        token: 'valid-token',
        tokenExpiresAt: new Date(Date.now() - 60000).toISOString(),
        refreshToken: 'refresh-token',
      }

      renderHook(() => useAuthMonitor())

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          configurable: true,
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'auth/refreshToken',
        payload: 'refresh-token',
      })
    })

    it('clears auth when token is expired and no refresh token', () => {
      mockAuthState = {
        token: 'valid-token',
        tokenExpiresAt: new Date(Date.now() - 60000).toISOString(),
        refreshToken: null as unknown as string,
      }

      renderHook(() => useAuthMonitor())

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          configurable: true,
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' })
    })

    it('does nothing when tab becomes visible and token is valid', () => {
      mockAuthState = {
        token: 'valid-token',
        tokenExpiresAt: new Date(Date.now() + 60000).toISOString(),
        refreshToken: 'refresh-token',
      }

      renderHook(() => useAuthMonitor())

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          configurable: true,
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })
})
