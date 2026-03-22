import { useState, useCallback } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { API_BASE_URL } from '../config/api';

interface UseFeedbackResult {
  message: string;
  setMessage: (message: string) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  submitFeedback: () => Promise<void>;
  reset: () => void;
}

export function useFeedback(): UseFeedbackResult {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setMessage('');
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  const submitFeedback = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/users/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSuccess(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  }, [message]);

  return {
    message,
    setMessage,
    isSubmitting,
    isSuccess,
    error,
    submitFeedback,
    reset,
  };
}
