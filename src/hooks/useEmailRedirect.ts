import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export type EmailRedirectState = 'loading' | 'error';

export function useEmailRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<EmailRedirectState>('loading');

  useEffect(() => {
    if (!id) {
      setState('error');
      return;
    }

    fetch(`${API_BASE_URL}/story-email/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch story email: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.story_id) throw new Error('No story_id in response');
        navigate(`/story/${data.story_id}`, { replace: true });
      })
      .catch(() => {
        setState('error');
      });
  }, [id, navigate]);

  return { state };
}
