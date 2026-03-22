import { useNavigate } from 'react-router-dom';
import { AccountSettingsForm } from './AccountSettingsForm';
import { FeedbackSection } from './FeedbackSection';
import { NavigationBar } from './NavigationBar';
import { useAppDispatch, useAppSelector } from '../store/store';
import { clearAuth, setUser } from '../store/authSlice';
import { signOut } from '../services/firebaseAuth';
import { persistor } from '../store/store';
import { getUserProfile } from '../store/userSlice';
import { useEffect } from 'react';

export function AccountSettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userProfile = useAppSelector((state) => state.user.profile);
  const isLoading = useAppSelector((state) => state.user.isLoading);
  const error = useAppSelector((state) => state.user.error);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (userProfile) {
      dispatch(setUser(userProfile));
    }
  }, [userProfile, dispatch]);

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

      // Broadcast logout to other tabs
      localStorage.setItem('logout-event', Date.now().toString());
      localStorage.removeItem('logout-event');

      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar
          onHomeClick={handleHomeClick}
          onLogout={handleLogout}
          onAccountClick={handleAccountClick}
        />
        <div className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">Loading account information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar
          onHomeClick={handleHomeClick}
          onLogout={handleLogout}
          onAccountClick={handleAccountClick}
        />
        <div className="flex items-center justify-center p-6">
          <div className="text-destructive">Failed to load account information. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar
        onHomeClick={handleHomeClick}
        onLogout={handleLogout}
        onAccountClick={handleAccountClick}
      />
      <div className="space-y-6 p-6">
        <AccountSettingsForm
          resetKey="account-page"
          onClose={handleHomeClick}
          closeLabel="Back to Home"
        />
        <FeedbackSection />
      </div>
    </div>
  );
}
