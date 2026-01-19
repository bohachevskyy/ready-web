import * as Sentry from '@sentry/react';

/**
 * Service for manually capturing errors to Sentry
 * Use this for caught errors that should still be reported
 */
export const errorService = {
  /**
   * Capture an exception with optional context
   */
  captureException(error: Error, context?: Record<string, any>) {
    const client = Sentry.getClient();

    if (client) {
      Sentry.captureException(error, {
        contexts: context,
      });
    } else {
      // Fallback to console in development
      console.error('Error (Sentry not initialized):', error, context);
    }
  },

  /**
   * Capture a message with optional level
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    const client = Sentry.getClient();

    if (client) {
      Sentry.captureMessage(message, level);
    } else {
      // Fallback to console in development
      console.log(`[${level}] ${message}`);
    }
  },

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    const client = Sentry.getClient();

    if (client) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  },
};
