import * as Sentry from '@sentry/react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StoryReader } from './components/StoryReader';
import { ModeSelection } from './components/ModeSelection';
import { StoryCategorySelection } from './components/StoryCategorySelection';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { AccountSettingsPage } from './components/AccountSettingsPage';
import { PracticeWords } from './components/PracticeWords';
import { Onboarding } from './components/Onboarding';
import { OnboardingCheck } from './components/OnboardingCheck';
import { useAuthMonitor } from './hooks/useAuthMonitor';
import { useSentryUser } from './hooks/useSentryUser';
import { I18nProvider } from './i18n/i18nContext';
import { ErrorFallback } from './components/ErrorFallback';
import './styles/App.css';

// Wrap Routes with Sentry for automatic navigation tracking
const SentryRoutes = Sentry.withSentryRouting(Routes);

function ModeSelectionWithNavigation() {
  const navigate = useNavigate();

  const handleSelectMode = (mode: "read" | "practice") => {
    if (mode === "read") {
      navigate('/story/category');
    } else {
      navigate('/practice');
    }
  };

  return <ModeSelection onSelectMode={handleSelectMode} />;
}

function StoryCategoryWithNavigation() {
  const navigate = useNavigate();

  const handleSelectDomain = (domain: string) => {
    navigate(`/story/${domain}`);
  };

  return <StoryCategorySelection onSelectDomain={handleSelectDomain} />;
}

function AuthMonitor() {
  useAuthMonitor();
  useSentryUser();
  return null;
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      <I18nProvider>
        <BrowserRouter>
          <AuthMonitor />
          <SentryRoutes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Layout>
                    <ModeSelectionWithNavigation />
                  </Layout>
                </OnboardingCheck>
              </ProtectedRoute>
            }
          />
          <Route
            path="/story/category"
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Layout>
                    <StoryCategoryWithNavigation />
                  </Layout>
                </OnboardingCheck>
              </ProtectedRoute>
            }
          />
          <Route
            path="/story/:domain"
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Layout>
                    <StoryReader />
                  </Layout>
                </OnboardingCheck>
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Layout>
                    <PracticeWords />
                  </Layout>
                </OnboardingCheck>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />
        </SentryRoutes>
      </BrowserRouter>
    </I18nProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
