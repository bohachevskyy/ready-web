import { useNavigate } from 'react-router-dom';
import { NavigationBar } from './NavigationBar';
import { useAppDispatch } from '../store/store';
import { clearAuth } from '../store/authSlice';
import { signOut } from '../services/firebaseAuth';
import { persistor } from '../store/store';
import { NetworkErrorBanner } from './NetworkErrorBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAccountClick = () => {
    navigate('/account');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(clearAuth());
      // Clear persisted state
      await persistor.purge();

      // Broadcast logout to other tabs
      localStorage.setItem('logout-event', Date.now().toString());
      localStorage.removeItem('logout-event');

      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <NetworkErrorBanner />
      <NavigationBar
        onHomeClick={handleHomeClick}
        onLogout={handleLogout}
        onAccountClick={handleAccountClick}
      />
      {children}
    </div>
  );
}
