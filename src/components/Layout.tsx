import { useNavigate } from 'react-router-dom';
import { NavigationBar } from './NavigationBar';
import { useAppDispatch } from '../store/store';
import { clearAuth } from '../store/authSlice';
import { signOut } from '../services/firebaseAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleHomeClick = () => {
    navigate('/');
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

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar onHomeClick={handleHomeClick} onLogout={handleLogout} />
      {children}
    </div>
  );
}
