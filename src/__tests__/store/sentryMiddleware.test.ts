/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { sentryMiddleware } from '../../store/sentryMiddleware';
import counterReducer from '../../store/counterSlice';

// Mock Sentry
jest.mock('@sentry/react');

describe('sentryMiddleware', () => {
  let mockGetClient: jest.Mock;
  let mockAddBreadcrumb: jest.Mock;
  let mockCaptureException: jest.Mock;

  beforeEach(() => {
    mockGetClient = jest.fn();
    mockAddBreadcrumb = jest.fn();
    mockCaptureException = jest.fn();

    (Sentry.getClient as jest.Mock) = mockGetClient;
    (Sentry.addBreadcrumb as jest.Mock) = mockAddBreadcrumb;
    (Sentry.captureException as jest.Mock) = mockCaptureException;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createStore = () => {
    return configureStore({
      reducer: {
        counter: counterReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sentryMiddleware),
    });
  };

  it('should add breadcrumb for Redux actions when Sentry is initialized', () => {
    mockGetClient.mockReturnValue({});

    const store = createStore();
    store.dispatch({ type: 'counter/increment' });

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'redux.action',
      message: 'counter/increment',
      level: 'info',
      data: {
        type: 'counter/increment',
        payload: undefined,
      },
    });
  });

  it('should redact auth-related action payloads', () => {
    mockGetClient.mockReturnValue({});

    const store = createStore();
    store.dispatch({
      type: 'auth/login',
      payload: { token: 'secret-token', user: { email: 'test@example.com' } },
    });

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'redux.action',
      message: 'auth/login',
      level: 'info',
      data: {
        type: 'auth/login',
        payload: '[REDACTED]',
      },
    });
  });

  it('should not add breadcrumb when Sentry is not initialized', () => {
    mockGetClient.mockReturnValue(null);

    const store = createStore();
    store.dispatch({ type: 'counter/increment' });

    expect(mockAddBreadcrumb).not.toHaveBeenCalled();
  });

  it('should capture exceptions that occur in middleware', () => {
    mockGetClient.mockReturnValue({});

    const errorMiddleware = () => (next: any) => (action: any) => {
      if (action.type === 'TEST_ERROR') {
        throw new Error('Test error');
      }
      return next(action);
    };

    const store = configureStore({
      reducer: {
        counter: counterReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sentryMiddleware, errorMiddleware),
    });

    expect(() => {
      store.dispatch({ type: 'TEST_ERROR' });
    }).toThrow('Test error');

    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        contexts: {
          redux: {
            action: 'TEST_ERROR',
          },
        },
      })
    );
  });

  it('should handle actions without type property', () => {
    mockGetClient.mockReturnValue({});

    const store = createStore();

    // This shouldn't throw an error
    store.dispatch({ type: 'counter/increment' });

    expect(mockAddBreadcrumb).toHaveBeenCalled();
  });
});
