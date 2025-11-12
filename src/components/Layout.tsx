import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationBar } from './NavigationBar';
import { useAppDispatch, useAppSelector } from '../store/store';
import { clearAuth } from '../store/authSlice';
import { signOut } from '../services/firebaseAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const accountWindowRef = useRef<Window | null>(null);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAccountClick = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (accountWindowRef.current && !accountWindowRef.current.closed) {
      accountWindowRef.current.focus();
      return;
    }

    const accountUrl = new URL('/account', window.location.origin);

    let payloadKey: string | null = null;

    if (token) {
      try {
        payloadKey = `account-settings-${Date.now()}`;
        window.localStorage.setItem(
          payloadKey,
          JSON.stringify({
            token,
            user: user ?? null,
          })
        );
        accountUrl.searchParams.set('payloadKey', payloadKey);
      } catch (error) {
        console.error('Failed to prepare account settings payload', error);
        payloadKey = null;
      }
    }

    const openedWindow = window.open(
      accountUrl.toString(),
      '_blank',
      'noopener,noreferrer,width=520,height=640'
    );

    if (openedWindow) {
      accountWindowRef.current = openedWindow;
    } else {
      window.location.href = accountUrl.toString();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(clearAuth());
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (accountWindowRef.current && !accountWindowRef.current.closed) {
        accountWindowRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar
        onHomeClick={handleHomeClick}
        onLogout={handleLogout}
        onAccountClick={handleAccountClick}
      />
      {children}
    </div>
  );
}
