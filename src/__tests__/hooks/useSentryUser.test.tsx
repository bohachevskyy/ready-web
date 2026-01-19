/// <reference types="jest" />

import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { useSentryUser } from '../../hooks/useSentryUser';
import authReducer from '../../store/authSlice';

// Mock Sentry
jest.mock('@sentry/react');

describe('useSentryUser', () => {
  let mockGetClient: jest.Mock;
  let mockSetUser: jest.Mock;

  beforeEach(() => {
    mockGetClient = jest.fn();
    mockSetUser = jest.fn();

    (Sentry.getClient as jest.Mock) = mockGetClient;
    (Sentry.setUser as jest.Mock) = mockSetUser;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createStore = (authState: any) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: authState,
      },
    });
  };

  it('should set user context when user is authenticated', () => {
    mockGetClient.mockReturnValue({});

    const user = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      firebase_uid: 'firebase-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const store = createStore({
      token: 'test-token',
      user,
      tokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      isLoading: false,
      error: null,
      networkError: false,
      uiLanguage: null,
    });

    renderHook(() => useSentryUser(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(mockSetUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'test@example.com',
      username: 'Test User',
    });
  });

  it('should use first_name and last_name if name is not available', () => {
    mockGetClient.mockReturnValue({});

    const user = {
      id: 'user-123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      firebase_uid: 'firebase-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const store = createStore({
      token: 'test-token',
      user,
      tokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      isLoading: false,
      error: null,
      networkError: false,
      uiLanguage: null,
    });

    renderHook(() => useSentryUser(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(mockSetUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'test@example.com',
      username: 'John Doe',
    });
  });

  it('should clear user context when user is logged out', () => {
    mockGetClient.mockReturnValue({});

    const store = createStore({
      token: null,
      user: null,
      tokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      isLoading: false,
      error: null,
      networkError: false,
      uiLanguage: null,
    });

    renderHook(() => useSentryUser(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });

  it('should not set user if Sentry is not initialized', () => {
    mockGetClient.mockReturnValue(null);

    const user = {
      id: 'user-123',
      email: 'test@example.com',
      firebase_uid: 'firebase-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const store = createStore({
      token: 'test-token',
      user,
      tokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      isLoading: false,
      error: null,
      networkError: false,
      uiLanguage: null,
    });

    renderHook(() => useSentryUser(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(mockSetUser).not.toHaveBeenCalled();
  });
});
