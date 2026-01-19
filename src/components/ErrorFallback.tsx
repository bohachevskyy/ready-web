import { AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { Button } from './ui/button';

interface ErrorFallbackProps {
  error: unknown;
  componentStack: string;
  eventId: string;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useTranslation();

  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-destructive mb-4 text-center">
          {t('error.title')}
        </h1>
        <p className="text-gray-700 mb-6 text-center">
          {t('error.description')}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="bg-gray-100 p-4 rounded mb-4 text-xs overflow-auto max-h-40">
            {errorMessage}
            {errorStack && `\n\n${errorStack}`}
          </pre>
        )}
        <Button onClick={resetError} className="w-full" size="lg">
          {t('error.tryAgain')}
        </Button>
      </div>
    </div>
  );
}
