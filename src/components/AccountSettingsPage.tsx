import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { AccountSettingsForm } from './AccountSettingsForm';
import { FeedbackSection } from './FeedbackSection';
import { NavigationBar } from './NavigationBar';
import { useAppDispatch, useAppSelector } from '../store/store';
import { clearAuth, setUser } from '../store/authSlice';
import { signOut } from '../services/firebaseAuth';
import { persistor } from '../store/store';
import { getUserProfile } from '../store/userSlice';
import { useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { DuoButton } from './ui/duo-button';
import { DuoCard } from './ui/duo-card';

export function AccountSettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const handleHomeClick = () => navigate('/');
  const handleAccountClick = () => {};

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(clearAuth());
      await persistor.purge();
      localStorage.setItem('logout-event', Date.now().toString());
      localStorage.removeItem('logout-event');
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <NavigationBar
          onHomeClick={handleHomeClick}
          onLogout={handleLogout}
          onAccountClick={handleAccountClick}
        />
        <div className="flex items-center justify-center p-6 text-ink-mute font-semibold">
          {t('account.loadingInfo')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <NavigationBar
          onHomeClick={handleHomeClick}
          onLogout={handleLogout}
          onAccountClick={handleAccountClick}
        />
        <div className="flex items-center justify-center p-6 text-heart-deep font-bold">
          {t('account.failedLoad')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <NavigationBar
        onHomeClick={handleHomeClick}
        onLogout={handleLogout}
        onAccountClick={handleAccountClick}
      />
      <div className="py-8 px-8 pb-20">
        <div className="max-w-[760px] mx-auto flex flex-col gap-5">
          <div className="anim-slide flex items-center gap-2 text-sm font-extrabold text-ink-soft">
            <button
              onClick={handleHomeClick}
              className="bg-transparent border-0 cursor-pointer text-brand-blue-deep flex items-center gap-1 px-2 py-1 rounded hover:bg-cream-2/40 font-extrabold text-[13px]"
            >
              <ChevronLeft className="h-4 w-4" /> {t('account.backToHome')}
            </button>
          </div>

          <AccountSettingsForm resetKey="account-page" />
          <FeedbackSection />

          {/* Danger zone */}
          <DuoCard className="anim-slide p-5 bg-[#FFF5F6] border-[#FFC2C8]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#FFE3E6] text-heart-deep grid place-items-center shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-base font-black text-heart-deep">
                  {t('account.signOut') || 'Sign out'}
                </div>
                <div className="text-ink-soft text-[13px] mt-0.5 font-semibold">
                  {t('account.signOutHint') || "You'll need to sign back in to keep your streak."}
                </div>
              </div>
              <DuoButton variant="danger" size="sm" onClick={handleLogout}>
                {t('navigation.logout') || 'Sign out'}
              </DuoButton>
            </div>
          </DuoCard>
        </div>
      </div>
    </div>
  );
}
