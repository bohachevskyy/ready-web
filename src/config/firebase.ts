import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Analytics (only in browser and if supported)
const shouldEnableAnalytics =
  process.env.NODE_ENV === 'production' ||
  process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

export const analyticsPromise: Promise<Analytics | null> = shouldEnableAnalytics
  ? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
  : Promise.resolve(null);

export default app;
