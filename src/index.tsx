import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PostHogProvider } from '@posthog/react';
import * as Sentry from '@sentry/react';
import { store, persistor } from './store/store';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeSentry } from './config/sentry';

// Initialize Sentry BEFORE React root creation
initializeSentry();

const posthogOptions = {
  api_host: process.env.REACT_APP_POSTHOG_HOST,
  defaults: '2026-01-30',
} as const;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <PostHogProvider apiKey={process.env.REACT_APP_POSTHOG_KEY!} options={posthogOptions}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </PostHogProvider>
  </React.StrictMode>
);

// Send Web Vitals to Sentry for performance monitoring
reportWebVitals((metric: any) => {
  // Send to Sentry if initialized
  if (metric && Sentry.getClient()) {
    Sentry.setMeasurement(metric.name, metric.value, metric.unit);
  }
});
