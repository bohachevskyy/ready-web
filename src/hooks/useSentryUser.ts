import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useAppSelector } from '../store/store';

/**
 * Hook to sync authenticated user with Sentry
 * Should be called in a component that's always mounted when user is authenticated
 */
export function useSentryUser() {
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const client = Sentry.getClient();

    if (client) {
      if (user) {
        // Set user context in Sentry
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        });
      } else {
        // Clear user context on logout
        Sentry.setUser(null);
      }
    }
  }, [user]);
}
