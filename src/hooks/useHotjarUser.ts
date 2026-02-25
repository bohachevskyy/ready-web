import { useEffect } from 'react';
import { useAppSelector } from '../store/store';
import { identifyHotjarUser } from '../config/hotjar';

/**
 * Hook to sync authenticated user with Hotjar.
 * Identifies the user by email when logged in.
 */
export function useHotjarUser() {
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      identifyHotjarUser(user.id, user.email);
    }
  }, [user]);
}
