/// <reference types="jest" />

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { OnboardingCheck } from './OnboardingCheck'
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

describe('OnboardingCheck', () => {
  let store: ReturnType<typeof createTestStore>

  const createTestStore = (initialState: any = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          token: 'token',
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

  it('should redirect to onboarding when birth_month is missing', () => {
    store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@test.com',
          firebase_uid: 'uid',
          created_at: '',
          updated_at: '',
          birth_month: null,
          birth_year: 2000,
          native_language: 'en',
          language_level: 3,
        },
      },
    })

    render(
      <Provider store={store}>
        <OnboardingCheck>
          <div>Main Content</div>
        </OnboardingCheck>
      </Provider>
    )

    expect(screen.queryByText('Main Content')).not.toBeInTheDocument()
  })

  it('should redirect to onboarding when birth_year is missing', () => {
    store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@test.com',
          firebase_uid: 'uid',
          created_at: '',
          updated_at: '',
          birth_month: 1,
          birth_year: null,
          native_language: 'en',
          language_level: 3,
        },
      },
    })

    render(
      <Provider store={store}>
        <OnboardingCheck>
          <div>Main Content</div>
        </OnboardingCheck>
      </Provider>
    )

    expect(screen.queryByText('Main Content')).not.toBeInTheDocument()
  })

  it('should redirect to onboarding when native_language is missing', () => {
    store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@test.com',
          firebase_uid: 'uid',
          created_at: '',
          updated_at: '',
          birth_month: 1,
          birth_year: 2000,
          native_language: null,
          language_level: 3,
        },
      },
    })

    render(
      <Provider store={store}>
        <OnboardingCheck>
          <div>Main Content</div>
        </OnboardingCheck>
      </Provider>
    )

    expect(screen.queryByText('Main Content')).not.toBeInTheDocument()
  })

  it('should redirect to onboarding when language_level is missing', () => {
    store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@test.com',
          firebase_uid: 'uid',
          created_at: '',
          updated_at: '',
          birth_month: 1,
          birth_year: 2000,
          native_language: 'en',
          language_level: null,
        },
      },
    })

    render(
      <Provider store={store}>
        <OnboardingCheck>
          <div>Main Content</div>
        </OnboardingCheck>
      </Provider>
    )

    expect(screen.queryByText('Main Content')).not.toBeInTheDocument()
  })

  it('should allow access when all profile fields are complete', () => {
    store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@test.com',
          firebase_uid: 'uid',
          created_at: '',
          updated_at: '',
          birth_month: 1,
          birth_year: 2000,
          native_language: 'en',
          language_level: 3,
        },
      },
    })

    render(
      <Provider store={store}>
        <OnboardingCheck>
          <div>Main Content</div>
        </OnboardingCheck>
      </Provider>
    )

    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('should allow access when user is null (not logged in)', () => {
    store = createTestStore({
      auth: {
        user: null,
      },
    })

    render(
      <Provider store={store}>
        <OnboardingCheck>
          <div>Main Content</div>
        </OnboardingCheck>
      </Provider>
    )

    // When user is null, needsOnboarding is false (user && ... evaluates to false), so should allow access
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('should redirect when birth_month is undefined', () => {
    store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@test.com',
          firebase_uid: 'uid',
          created_at: '',
          updated_at: '',
          birth_month: undefined,
          birth_year: 2000,
          native_language: 'en',
          language_level: 3,
        },
      },
    })

    render(
      <Provider store={store}>
        <OnboardingCheck>
          <div>Main Content</div>
        </OnboardingCheck>
      </Provider>
    )

    expect(screen.queryByText('Main Content')).not.toBeInTheDocument()
  })
})

