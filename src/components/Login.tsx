import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import { AsYouType } from 'libphonenumber-js';
import { useAppDispatch, useAppSelector } from '../store/store';
import { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, initializeRecaptcha, sendPhoneOTP, verifyPhoneOTP } from '../services/firebaseAuth';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Apple, Phone, Mail, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [authError, setAuthError] = useState<string | null>(null);
  const [method, setMethod] = useState<'choice' | 'phone' | 'email'>('choice');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaInitialized = useRef(false);

  useEffect(() => {
    // Initialize reCAPTCHA only once when component mounts
    if (!recaptchaInitialized.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          // Use 'invisible' for better UX - it will automatically verify
          recaptchaVerifierRef.current = initializeRecaptcha('recaptcha-container', 'invisible');
          recaptchaInitialized.current = true;
          console.log('reCAPTCHA initialized successfully');
        } catch (err) {
          console.error('Failed to initialize reCAPTCHA:', err);
          setAuthError('Failed to initialize phone verification. Please refresh the page.');
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        // Clean up reCAPTCHA on component unmount
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
          } catch (err) {
            console.error('Error clearing reCAPTCHA:', err);
          }
        }
      };
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatter = new AsYouType('US');
    const formatted = formatter.input(input);
    setPhoneNumber(formatted);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      setAuthError('Please enter a valid phone number');
      return;
    }

    if (!recaptchaVerifierRef.current) {
      setAuthError('Phone verification not ready. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      // Convert formatted number to E.164 format for Firebase
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const e164Number = cleanNumber.startsWith('1') ? `+${cleanNumber}` : `+1${cleanNumber}`;

      await sendPhoneOTP(e164Number, recaptchaVerifierRef.current);
      setStep('otp');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setAuthError('Invalid phone number format');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Too many attempts. Please try again later.');
      } else {
        setAuthError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setAuthError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await verifyPhoneOTP(otp, dispatch);
      navigate('/');
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setAuthError('Invalid verification code');
      } else if (err.code === 'auth/code-expired') {
        setAuthError('Code expired. Please request a new one.');
        setStep('input');
        setOtp('');
      } else {
        setAuthError('Failed to verify code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setAuthError(null);
      if (provider === 'google') {
        await signInWithGoogle(dispatch);
      } else {
        await signInWithApple(dispatch);
      }
      navigate('/');
    } catch (err) {
      setAuthError(`Failed to sign in with ${provider}. Please try again.`);
      console.error(err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    if (emailMode === 'signup') {
      if (!confirmPassword) {
        setAuthError('Please confirm your password');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters');
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
      navigate('/');
    } catch (err: any) {
      console.error(`Error ${emailMode === 'signup' ? 'signing up' : 'signing in'} with email:`, err);
      if (emailMode === 'signin') {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          setAuthError('Invalid email or password');
        } else if (err.code === 'auth/user-not-found') {
          setAuthError('No account found with this email');
        } else if (err.code === 'auth/too-many-requests') {
          setAuthError('Too many failed attempts. Please try again later.');
        } else {
          setAuthError('Failed to sign in. Please try again.');
        }
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setAuthError('An account with this email already exists');
        } else if (err.code === 'auth/invalid-email') {
          setAuthError('Invalid email address');
        } else if (err.code === 'auth/weak-password') {
          setAuthError('Password is too weak');
        } else {
          setAuthError('Failed to create account. Please try again.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 bg-card shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome</h1>
          <p className="text-muted-foreground">Sign in to continue learning</p>
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
              Continue with Google
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
                Continue with Apple
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => {
                setMethod('phone');
                setStep('input');
              }}
            >
              <Phone className="h-5 w-5" />
              Continue with Phone Number
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => {
                setMethod('email');
                setStep('input');
              }}
            >
              <Mail className="h-5 w-5" />
              Continue with Email
            </Button>
          </div>
        )}

        {method === 'phone' && step === 'input' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isSubmitting}
                className="text-base"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Verification Code'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMethod('choice');
                setPhoneNumber('');
                setAuthError(null);
              }}
            >
              Back to sign in options
            </Button>
          </form>
        )}

        {method === 'phone' && step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={isSubmitting}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || otp.length !== 6}>
              {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('input');
                setOtp('');
                setAuthError(null);
              }}
            >
              Back to phone number
            </Button>
          </form>
        )}

        {method === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
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
              {isSubmitting ? (emailMode === 'signin' ? 'Signing in...' : 'Signing up...') : (emailMode === 'signin' ? 'Sign In' : 'Sign Up')}
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
                {emailMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
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
              Back to sign in options
            </Button>
          </form>
        )}

        {(error || authError) && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
            {error || authError}
          </div>
        )}

        {/* reCAPTCHA container - Firebase requires this element for phone auth */}
        <div id="recaptcha-container" className="mt-4"></div>
      </Card>
    </div>
  );
}
