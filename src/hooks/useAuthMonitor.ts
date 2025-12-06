import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/store';
import { clearAuth, refreshAccessToken } from '../store/authSlice';
import { isTokenExpired } from '../utils/tokenRefreshScheduler';

/**
 * Global authentication monitor hook
 * Handles authentication state changes and ensures users are redirected when auth is lost
 */
export function useAuthMonitor() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { token, tokenExpiresAt, refreshToken } = useAppSelector(state => state.auth);
  const previousTokenRef = useRef(token);

  // 1. Monitor token changes - redirect when token is cleared
  useEffect(() => {
    if (previousTokenRef.current && !token) {
      console.log('[AuthMonitor] Auth cleared, redirecting to login');
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
    previousTokenRef.current = token;
  }, [token, navigate, location]);

  // 2. Cross-tab logout detection
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout-event' ||
          (e.key === 'persist:auth' && !e.newValue)) {
        console.log('[AuthMonitor] Logout detected from another tab');
        dispatch(clearAuth());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  // 3. Token expiration check on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && token && tokenExpiresAt) {
        if (isTokenExpired(tokenExpiresAt)) {
          console.log('[AuthMonitor] Token expired while tab was hidden');
          if (refreshToken) {
            dispatch(refreshAccessToken(refreshToken));
          } else {
            dispatch(clearAuth());
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [token, tokenExpiresAt, refreshToken, dispatch]);
}
