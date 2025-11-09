import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import { AsYouType } from 'libphonenumber-js';
import { useAppDispatch, useAppSelector } from '../store/store';
import { signInWithGoogle, signInWithApple, initializeRecaptcha, sendPhoneOTP, verifyPhoneOTP } from '../services/firebaseAuth';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [authError, setAuthError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle(dispatch);
      navigate('/');
    } catch (err) {
      setAuthError('Failed to sign in with Google. Please try again.');
      console.error(err);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithApple(dispatch);
      navigate('/');
    } catch (err) {
      setAuthError('Failed to sign in with Apple. Please try again.');
      console.error(err);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatter = new AsYouType('US');
    const formatted = formatter.input(input);
    setPhoneNumber(formatted);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
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
        setStep('phone');
        setOtp('');
      } else {
        setAuthError('Failed to verify code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Ready</h1>
          <p className="text-muted-foreground">
            {step === 'phone' ? 'Sign in to continue learning' : 'Enter verification code'}
          </p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={isSubmitting}
                  className="text-lg"
                  autoComplete="tel"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  US phone number
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !phoneNumber}
                className="w-full"
              >
                {isSubmitting ? 'Sending...' : 'Continue'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading || isSubmitting}
              className="w-full"
              variant="outline"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            {process.env.REACT_APP_ENABLE_APPLE_LOGIN === 'true' && (
              <Button
                onClick={handleAppleSignIn}
                disabled={isLoading || isSubmitting}
                className="w-full"
                variant="outline"
              >
                {isLoading ? 'Signing in...' : 'Sign in with Apple'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isSubmitting}
                  className="text-lg text-center tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Code sent to {phoneNumber}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="w-full"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setAuthError(null);
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </form>
          </div>
        )}

        {(error || authError) && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
            {error || authError}
          </div>
        )}

        {/* reCAPTCHA container - Firebase requires this element for phone auth */}
        {/* For invisible reCAPTCHA, it remains hidden. For visible, it will show the widget */}
        <div id="recaptcha-container" className="mt-4"></div>
      </Card>
    </div>
  );
}
