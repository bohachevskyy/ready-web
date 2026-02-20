import { useEffect } from 'react';
import { useAppSelector } from '../store/store';
import { setUserId } from '../services/analyticsService';

export function useAnalyticsUser() {
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    setUserId(user ? user.id : null);
  }, [user]);
}
