import { Middleware } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

/**
 * Sentry middleware for Redux
 * Captures Redux actions and state changes as breadcrumbs
 */
export const sentryMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  // Type guard for actions with a 'type' property
  const hasType = (action: unknown): action is { type: string; payload?: any } => {
    return typeof action === 'object' && action !== null && 'type' in action;
  };

  if (hasType(action)) {
    // Check if Sentry is initialized
    const client = Sentry.getClient();

    if (client) {
      // Add Redux action as breadcrumb
      Sentry.addBreadcrumb({
        category: 'redux.action',
        message: action.type,
        level: 'info',
        data: {
          type: action.type,
          // Redact sensitive auth-related data
          payload: action.type.includes('auth/') ? '[REDACTED]' : action.payload,
        },
      });
    }
  }

  try {
    return next(action);
  } catch (error) {
    // Capture middleware errors with Redux context
    const client = Sentry.getClient();

    if (client && error instanceof Error) {
      Sentry.captureException(error, {
        contexts: {
          redux: {
            action: hasType(action) ? action.type : 'unknown',
          },
        },
      });
    }

    throw error;
  }
};
