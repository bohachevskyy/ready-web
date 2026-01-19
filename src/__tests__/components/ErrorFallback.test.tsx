/// <reference types="jest" />

import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from '../../components/ErrorFallback';

// Mock the useTranslation hook
jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'error.title': 'Something went wrong',
        'error.description': 'We are sorry, but something unexpected happened.',
        'error.tryAgain': 'Try Again',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error title and description', () => {
    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('We are sorry, but something unexpected happened.')
    ).toBeInTheDocument();
  });

  it('should render try again button', () => {
    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    const button = screen.getByText('Try Again');
    expect(button).toBeInTheDocument();
  });

  it('should call resetError when try again button is clicked', () => {
    render(<ErrorFallback error={mockError} resetError={mockResetError} />);

    const button = screen.getByText('Try Again');
    fireEvent.click(button);

    expect(mockResetError).toHaveBeenCalledTimes(1);
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const errorWithStack = new Error('Test error');
    errorWithStack.stack = 'Error: Test error\n    at TestFile.js:10:15';

    render(<ErrorFallback error={errorWithStack} resetError={mockResetError} />);

    expect(screen.getByText(/Test error/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const errorWithStack = new Error('Test error');
    errorWithStack.stack = 'Error: Test error\n    at TestFile.js:10:15';

    render(<ErrorFallback error={errorWithStack} resetError={mockResetError} />);

    // Error message should not be visible in production
    const preElements = screen.queryAllByText(/Test error/);
    expect(preElements.length).toBe(0);

    process.env.NODE_ENV = originalEnv;
  });
});
