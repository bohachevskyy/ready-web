/// <reference types="jest" />

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ProtectedRoute } from './ProtectedRoute'
import authReducer from '../store/authSlice'

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Navigate: ({ to }: { to: string }) => <div>Navigate to {to}</div>,
  }
})

describe('ProtectedRoute', () => {
  let store: ReturnType<typeof createTestStore>

  const createTestStore = (initialState: any = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          token: null,
          tokenExpiresAt: null,
          refreshToken: null,
          refreshTokenExpiresAt: null,
          user: null,
          isLoading: false,
          error: null,
          networkError: false,
          uiLanguage: null,
          ...initialState.auth,
        },
      },
    })
  }

  beforeEach(() => {
    store = createTestStore()
  })

  it('should redirect to login when no token', () => {
    store = createTestStore({
      auth: {
        token: null,
      },
    })

    render(
      <Provider store={store}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </Provider>
    )

    // Should redirect to login (Navigate component)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when token exists', () => {
    store = createTestStore({
      auth: {
        token: 'valid-token',
      },
    })

    render(
      <Provider store={store}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </Provider>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should redirect when token is empty string', () => {
    store = createTestStore({
      auth: {
        token: '',
      },
    })

    render(
      <Provider store={store}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </Provider>
    )

    // Empty string is falsy, so should redirect
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})

