// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Sentry globally for all tests
jest.mock('@sentry/react', () => {
  const actual = jest.requireActual('@sentry/react');
  return {
    ...actual,
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    addBreadcrumb: jest.fn(),
    setUser: jest.fn(),
    setMeasurement: jest.fn(),
    getClient: jest.fn(() => null),
    withSentryRouting: (Component) => Component,
    ErrorBoundary: ({ children }) => children,
    browserTracingIntegration: jest.fn(),
    replayIntegration: jest.fn(),
  };
});
