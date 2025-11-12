import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountSettingsForm } from './AccountSettingsForm';
import { type RootState, useAppDispatch, useAppSelector } from '../store/store';
import { setToken, setUser } from '../store/authSlice';

export function AccountSettingsPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const payloadKey = searchParams.get('payloadKey');

  useEffect(() => {
    if (typeof window === 'undefined' || !payloadKey) {
      return;
    }

    try {
      const stored = window.localStorage.getItem(payloadKey);

      if (stored) {
        const parsed = JSON.parse(stored) as {
          token?: string;
          user?: RootState['auth']['user'];
        };

        if (!token && parsed.token) {
          dispatch(setToken(parsed.token));
        }

        if ('user' in parsed) {
          dispatch(setUser(parsed.user ?? null));
        }
      }
    } catch (error) {
      console.error('Failed to hydrate account settings window', error);
    } finally {
      window.localStorage.removeItem(payloadKey);
    }
  }, [dispatch, payloadKey, token]);

  const handleCloseWindow = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <AccountSettingsForm
          resetKey="account-page"
          onClose={handleCloseWindow}
          closeLabel="Close window"
        />
      </div>
    </div>
  );
}
