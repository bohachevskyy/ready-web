import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { AppDispatch } from '../store/store';
import { loginWithFirebase } from '../store/authSlice';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Store confirmation result for phone verification
let confirmationResult: ConfirmationResult | null = null;

/**
 * Sign in with Google using Firebase
 * Returns the Firebase ID token which can be exchanged with backend
 */
export const signInWithGoogle = async (dispatch: AppDispatch): Promise<void> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Exchange Firebase token with backend
    await dispatch(loginWithFirebase({ firebase_token: idToken })).unwrap();
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign in with Apple using Firebase
 * Returns the Firebase ID token which can be exchanged with backend
 */
export const signInWithApple = async (dispatch: AppDispatch): Promise<void> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, appleProvider);
    const idToken = await result.user.getIdToken();

    // Exchange Firebase token with backend
    await dispatch(loginWithFirebase({ firebase_token: idToken })).unwrap();
  } catch (error) {
    console.error('Error signing in with Apple:', error);
    throw error;
  }
};

/**
 * Initialize reCAPTCHA verifier for phone authentication
 * This should be called when the phone login UI is mounted
 * @param containerId - The ID of the container element for reCAPTCHA
 * @param size - 'invisible' for automatic verification or 'normal' for visible widget
 */
export const initializeRecaptcha = (
  containerId: string,
  size: 'invisible' | 'normal' = 'invisible'
): RecaptchaVerifier => {
  // Firebase v9+ uses modular API - auth instance is first parameter
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    'size': size,
    'callback': (response: any) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired, user needs to solve reCAPTCHA again
      console.warn('reCAPTCHA expired');
    }
  });

  return recaptchaVerifier;
};

/**
 * Send OTP to phone number
 * Returns a promise that resolves when SMS is sent
 */
export const sendPhoneOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<void> => {
  try {
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP code and authenticate with backend
 * Returns the Firebase ID token which can be exchanged with backend
 */
export const verifyPhoneOTP = async (
  code: string,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    if (!confirmationResult) {
      throw new Error('No confirmation result available. Please request OTP first.');
    }

    const result: UserCredential = await confirmationResult.confirm(code);
    const idToken = await result.user.getIdToken();

    // Exchange Firebase token with backend
    await dispatch(loginWithFirebase({ firebase_token: idToken })).unwrap();

    // Clear confirmation result after successful verification
    confirmationResult = null;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Sign in with email and password using Firebase
 * Returns the Firebase ID token which can be exchanged with backend
 */
export const signInWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();

    // Exchange Firebase token with backend
    await dispatch(loginWithFirebase({ firebase_token: idToken })).unwrap();
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

/**
 * Create account with email and password using Firebase
 * Returns the Firebase ID token which can be exchanged with backend
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();

    // Exchange Firebase token with backend
    await dispatch(loginWithFirebase({ firebase_token: idToken })).unwrap();
  } catch (error) {
    console.error('Error creating account with email:', error);
    throw error;
  }
};

/**
 * Sign out from Firebase
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
    confirmationResult = null; // Clear any pending phone verification
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
