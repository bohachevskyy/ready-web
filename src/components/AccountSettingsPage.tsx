import { useNavigate } from 'react-router-dom';
import { AccountSettingsForm } from './AccountSettingsForm';
import { NavigationBar } from './NavigationBar';
import { useAppDispatch } from '../store/store';
import { clearAuth } from '../store/authSlice';
import { signOut } from '../services/firebaseAuth';
import { persistor } from '../store/store';

export function AccountSettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAccountClick = () => {
    // Already on account page, do nothing
  };

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(clearAuth());
      await persistor.purge();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar
        onHomeClick={handleHomeClick}
        onLogout={handleLogout}
        onAccountClick={handleAccountClick}
      />
      <div className="p-6">
        <AccountSettingsForm
          resetKey="account-page"
          onClose={handleHomeClick}
          closeLabel="Back to Home"
        />
      </div>
    </div>
  );
}
