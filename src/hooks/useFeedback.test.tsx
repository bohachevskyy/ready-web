import { renderHook, act } from '@testing-library/react'
import { useFeedback } from './useFeedback'

// Mock fetchWithAuth
jest.mock('../utils/fetchWithAuth', () => ({
  fetchWithAuth: jest.fn(),
}))

import { fetchWithAuth } from '../utils/fetchWithAuth'

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('useFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useFeedback())
    expect(result.current.message).toBe('')
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('updates message', () => {
    const { result } = renderHook(() => useFeedback())
    act(() => result.current.setMessage('Great app!'))
    expect(result.current.message).toBe('Great app!')
  })

  it('sets error when submitting empty message', async () => {
    const { result } = renderHook(() => useFeedback())
    await act(async () => {
      await result.current.submitFeedback()
    })
    expect(result.current.error).toBe('Please enter your feedback')
    expect(mockFetchWithAuth).not.toHaveBeenCalled()
  })

  it('sets error when submitting whitespace-only message', async () => {
    const { result } = renderHook(() => useFeedback())
    act(() => result.current.setMessage('   '))
    await act(async () => {
      await result.current.submitFeedback()
    })
    expect(result.current.error).toBe('Please enter your feedback')
    expect(mockFetchWithAuth).not.toHaveBeenCalled()
  })

  it('submits feedback successfully', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: true } as Response)

    const { result } = renderHook(() => useFeedback())
    act(() => result.current.setMessage('Love it!'))

    await act(async () => {
      await result.current.submitFeedback()
    })

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('/users/feedback'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Love it!' }),
      })
    )
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.message).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('handles API error', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: false, status: 500 } as Response)

    const { result } = renderHook(() => useFeedback())
    act(() => result.current.setMessage('Some feedback'))

    await act(async () => {
      await result.current.submitFeedback()
    })

    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBe('Failed to submit feedback')
  })

  it('handles network error', async () => {
    mockFetchWithAuth.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useFeedback())
    act(() => result.current.setMessage('Some feedback'))

    await act(async () => {
      await result.current.submitFeedback()
    })

    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBe('Network error')
  })

  it('resets state', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: true } as Response)

    const { result } = renderHook(() => useFeedback())
    act(() => result.current.setMessage('Feedback'))
    await act(async () => {
      await result.current.submitFeedback()
    })

    act(() => result.current.reset())

    expect(result.current.message).toBe('')
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('trims message before sending', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: true } as Response)

    const { result } = renderHook(() => useFeedback())
    act(() => result.current.setMessage('  trimmed  '))

    await act(async () => {
      await result.current.submitFeedback()
    })

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ message: 'trimmed' }),
      })
    )
  })
})
