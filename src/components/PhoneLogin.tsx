import { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { initializeRecaptcha, sendPhoneOTP, verifyPhoneOTP } from '../services/firebaseAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface PhoneLoginProps {
  onBack: () => void;
}

export function PhoneLogin({ onBack }: PhoneLoginProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaInitialized = useRef(false);

  useEffect(() => {
    // Initialize reCAPTCHA only once
    if (!recaptchaInitialized.current) {
      try {
        recaptchaVerifierRef.current = initializeRecaptcha('recaptcha-container');
        recaptchaInitialized.current = true;
      } catch (err) {
        console.error('Failed to initialize reCAPTCHA:', err);
        setError('Failed to initialize phone verification. Please refresh the page.');
      }
    }

    return () => {
      // Cleanup reCAPTCHA on unmount
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (err) {
          console.error('Error clearing reCAPTCHA:', err);
        }
      }
    };
  }, []);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Ensure it starts with + if not empty
    if (numbers.length === 0) return '';

    return '+' + numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }

    if (!recaptchaVerifierRef.current) {
      setError('Phone verification not ready. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await sendPhoneOTP(phoneNumber, recaptchaVerifierRef.current);
      setStep('otp');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Use international format (e.g., +1234567890)');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await verifyPhoneOTP(otp, dispatch);
      navigate('/');
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('Verification code expired. Please request a new one.');
        setStep('phone');
        setOtp('');
      } else {
        setError('Failed to verify code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Phone Sign In</h1>
          <p className="text-muted-foreground">
            {step === 'phone'
              ? 'Enter your phone number to receive a verification code'
              : 'Enter the 6-digit code sent to your phone'}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isSubmitting}
                className="text-lg"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !phoneNumber}
              className="w-full"
            >
              {isSubmitting ? 'Sending...' : 'Send Verification Code'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full"
            >
              Back to Login Options
            </Button>
          </form>
        ) : (
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
              onClick={handleBackToPhone}
              disabled={isSubmitting}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </form>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* reCAPTCHA container - invisible */}
        <div id="recaptcha-container" className="hidden"></div>
      </Card>
    </div>
  );
}
