import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error monitoring and performance tracking
 * Only initializes in production or when REACT_APP_ENABLE_SENTRY is true
 */
export const initializeSentry = () => {
  const shouldInitialize =
    process.env.NODE_ENV === 'production' ||
    process.env.REACT_APP_ENABLE_SENTRY === 'true';

  if (!shouldInitialize) {
    return;
  }

  const dsn = process.env.REACT_APP_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn,

    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    // Performance Monitoring - sample rate for production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay - for debugging user sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Environment tracking
    environment: process.env.NODE_ENV || 'development',

    // Release tracking (use git commit SHA or version)
    release: process.env.REACT_APP_VERSION,

    // Send user PII as requested
    sendDefaultPii: true,

    // Filter out errors that are already handled
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Filter out network errors already handled by NetworkErrorBanner
      if (error instanceof Error) {
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network request failed')
        ) {
          return null;
        }
      }

      return event;
    },

    // Explicitly set enabled flag
    enabled: shouldInitialize,
  });
};
