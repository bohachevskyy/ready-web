import { renderHook, waitFor } from '@testing-library/react';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

jest.mock('../config/api', () => ({
  API_BASE_URL: 'http://test-api',
}));

import { useParams } from 'react-router-dom';
import { useEmailRedirect } from './useEmailRedirect';

const mockUseParams = useParams as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('useEmailRedirect', () => {
  it('should redirect to story page on success', async () => {
    mockUseParams.mockReturnValue({ id: 'abc123' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ story_id: 'story-uuid-456' }),
    });

    renderHook(() => useEmailRedirect());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://test-api/story-email/abc123');
      expect(mockNavigate).toHaveBeenCalledWith('/story/story-uuid-456', { replace: true });
    });
  });

  it('should set error state when fetch fails', async () => {
    mockUseParams.mockReturnValue({ id: 'bad-id' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useEmailRedirect());

    await waitFor(() => {
      expect(result.current.state).toBe('error');
    });
  });

  it('should set error state when no id param', () => {
    mockUseParams.mockReturnValue({});

    const { result } = renderHook(() => useEmailRedirect());

    expect(result.current.state).toBe('error');
  });

  it('should set error state when response has no story_id', async () => {
    mockUseParams.mockReturnValue({ id: 'abc123' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useEmailRedirect());

    await waitFor(() => {
      expect(result.current.state).toBe('error');
    });
  });
});
