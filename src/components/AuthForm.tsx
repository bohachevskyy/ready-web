import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
} from '../services/firebaseAuth';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { DuoButton } from './ui/duo-button';
import { cn } from '../lib/utils';

interface AuthFormProps {
  onSuccess: () => void;
}

type Mode = 'signup' | 'signin';

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setAuthError(null);
      if (provider === 'google') {
        await signInWithGoogle(dispatch);
      } else {
        await signInWithApple(dispatch);
      }
      onSuccess();
    } catch (err) {
      setAuthError(t('auth.errors.socialLoginFailed', { provider }));
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAuthError(t('auth.errors.emailPasswordRequired'));
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setAuthError(t('auth.errors.passwordTooShort'));
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, dispatch);
      } else {
        await signInWithEmail(email, password, dispatch);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (mode === 'signin') {
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

  const switchMode = (m: Mode) => {
    setMode(m);
    setAuthError(null);
  };

  return (
    <div className="anim-slide w-full max-w-[400px] mx-auto">
      {/* Tab toggle */}
      <div className="flex gap-1.5 bg-cream-2 p-1.5 rounded-[14px] mb-6">
        {(['signup', 'signin'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              'flex-1 border-0 py-2.5 font-black text-[13px] tracking-wider uppercase rounded-[10px] cursor-pointer font-sans',
              mode === m
                ? 'bg-paper text-ink shadow-[0_2px_0_hsl(var(--line-2))]'
                : 'bg-transparent text-ink-mute',
            )}
          >
            {m === 'signup' ? t('auth.createAccount') || 'Create account' : t('auth.signInTab') || 'Sign in'}
          </button>
        ))}
      </div>

      <h2 className="font-black text-[30px] leading-[1] mb-1.5 tracking-tight">
        {mode === 'signup'
          ? t('auth.signupHeadline') || 'Start reading today.'
          : t('auth.signinHeadline') || 'Welcome back.'}
      </h2>
      <p className="text-ink-soft text-[15px] mt-0 mb-5">
        {mode === 'signup'
          ? t('auth.signupSub') || 'Takes 30 seconds. No card needed.'
          : t('auth.signinSub') || 'Pick up where you left off.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex items-center gap-3 bg-paper border-2 border-line rounded-[14px] px-4">
          <Mail className="h-5 w-5 text-ink-mute shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email.placeholder')}
            disabled={isSubmitting}
            autoComplete="email"
            className="flex-1 border-0 outline-none bg-transparent text-base font-semibold py-3.5 placeholder:text-ink-mute"
          />
        </label>
        <label className="flex items-center gap-3 bg-paper border-2 border-line rounded-[14px] px-4">
          <Lock className="h-5 w-5 text-ink-mute shrink-0" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === 'signup'
                ? t('auth.passwordHint') || 'At least 6 characters'
                : t('auth.email.passwordPlaceholder')
            }
            disabled={isSubmitting}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="flex-1 border-0 outline-none bg-transparent text-base font-semibold py-3.5 placeholder:text-ink-mute"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="bg-transparent border-0 text-ink-mute cursor-pointer p-1"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </label>

        {(authError || error) && (
          <div className="anim-shake bg-[#FFE3E6] text-heart-deep border-2 border-[#FFC2C8] px-3.5 py-2.5 rounded-[12px] font-bold text-sm">
            {authError || error}
          </div>
        )}

        <DuoButton type="submit" size="lg" block className="mt-1.5" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'signup'
              ? t('common.signingUp')
              : t('common.signingIn')
            : mode === 'signup'
            ? t('auth.signupCta') || "Let's go"
            : t('auth.email.signInButton')}
        </DuoButton>
      </form>

      <div className="flex items-center gap-3 my-5 text-ink-mute font-bold text-xs">
        <div className="flex-1 h-0.5 bg-line" />
        {t('auth.or') || 'OR'}
        <div className="flex-1 h-0.5 bg-line" />
      </div>

      <div className="flex flex-col gap-2.5">
        <DuoButton
          type="button"
          variant="secondary"
          block
          onClick={() => handleSocialLogin('google')}
          disabled={isSubmitting}
        >
          <GoogleIcon /> {t('auth.continueWithGoogle')}
        </DuoButton>

        {process.env.REACT_APP_ENABLE_APPLE_LOGIN === 'true' && (
          <DuoButton
            type="button"
            variant="secondary"
            block
            onClick={() => handleSocialLogin('apple')}
            disabled={isSubmitting}
          >
            <AppleIcon /> {t('auth.continueWithApple')}
          </DuoButton>
        )}
      </div>

      <p className="text-ink-mute text-[11px] mt-5 text-center">
        {t('auth.terms') || 'By continuing you agree to our Terms and Privacy Policy.'}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6Z"/>
      <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0 0 12 22Z"/>
      <path fill="#FBBC05" d="M6.2 13.6c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V6.9H2.7A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.3l3.2-2.7Z"/>
      <path fill="#EA4335" d="M12 5.7c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 12 2 10 10 0 0 0 2.7 6.9l3.5 2.7C7 7.4 9.3 5.7 12 5.7Z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="#000" aria-hidden>
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.4-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1 1-4 2.5-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.5 1.2 0 1.7-.8 3.1-.8 1.4 0 1.9.8 3.1.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-3.5ZM14.2 5.6c.7-.8 1.1-2 1-3.1-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.9-1 3 1.1 0 2.2-.6 2.8-1.4Z"/>
    </svg>
  );
}
