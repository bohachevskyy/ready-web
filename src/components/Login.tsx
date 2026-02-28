import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } from '../services/firebaseAuth';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Apple, Mail, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);
  const returnTo = (location.state as { from?: string })?.from || '/';

  const [authError, setAuthError] = useState<string | null>(null);
  const [method, setMethod] = useState<'choice' | 'email'>('choice');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setAuthError(null);
      if (provider === 'google') {
        await signInWithGoogle(dispatch);
      } else {
        await signInWithApple(dispatch);
      }
      navigate(returnTo);
    } catch (err) {
      setAuthError(t('auth.errors.socialLoginFailed', { provider }));
      console.error(err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAuthError(t('auth.errors.emailPasswordRequired'));
      return;
    }

    if (emailMode === 'signup') {
      if (!confirmPassword) {
        setAuthError(t('auth.errors.confirmPasswordRequired'));
        return;
      }
      if (password !== confirmPassword) {
        setAuthError(t('auth.errors.passwordMismatch'));
        return;
      }
      if (password.length < 6) {
        setAuthError(t('auth.errors.passwordTooShort'));
        return;
      }
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (emailMode === 'signup') {
        await signUpWithEmail(email, password, dispatch);
      } else {
        await signInWithEmail(email, password, dispatch);
      }
      navigate(returnTo);
    } catch (err: any) {
      console.error(`Error ${emailMode === 'signup' ? 'signing up' : 'signing in'} with email:`, err);
      if (emailMode === 'signin') {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          setAuthError(t('auth.errors.invalidCredentials'));
        } else if (err.code === 'auth/user-not-found') {
          setAuthError(t('auth.errors.userNotFound'));
        } else if (err.code === 'auth/too-many-requests') {
          setAuthError(t('auth.errors.tooManyAttempts'));
        } else {
          setAuthError(t('auth.errors.signInFailed'));
        }
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setAuthError(t('auth.errors.emailInUse'));
        } else if (err.code === 'auth/invalid-email') {
          setAuthError(t('auth.errors.invalidEmail'));
        } else if (err.code === 'auth/weak-password') {
          setAuthError(t('auth.errors.weakPassword'));
        } else {
          setAuthError(t('auth.errors.signUpFailed'));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-8 bg-card shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.welcome')}</h1>
          <p className="text-muted-foreground">{t('auth.signInPrompt')}</p>
        </div>

        {method === 'choice' && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => handleSocialLogin('google')}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.continueWithGoogle')}
            </Button>

            {process.env.REACT_APP_ENABLE_APPLE_LOGIN === 'true' && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                size="lg"
                onClick={() => handleSocialLogin('apple')}
              >
                <Apple className="h-5 w-5" />
                {t('auth.continueWithApple')}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => setMethod('email')}
            >
              <Mail className="h-5 w-5" />
              {t('auth.continueWithEmail')}
            </Button>
          </div>
        )}

        {method === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email.label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.email.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.email.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.email.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="text-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {emailMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.email.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth.email.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (emailMode === 'signin' ? t('common.signingIn') : t('common.signingUp')) : (emailMode === 'signin' ? t('auth.email.signInButton') : t('auth.email.signUpButton'))}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                  setConfirmPassword('');
                  setAuthError(null);
                }}
                className="text-sm text-primary hover:underline"
              >
                {emailMode === 'signin' ? t('auth.email.noAccount') : t('auth.email.hasAccount')}
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMethod('choice');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setEmailMode('signin');
                setAuthError(null);
              }}
            >
              {t('auth.email.backToOptions')}
            </Button>
          </form>
        )}

        {(error || authError) && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
            {error || authError}
          </div>
        )}
      </Card>
    </div>
  );
}
