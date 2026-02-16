import { renderHook, act } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockT = jest.fn((key: string) => key)

let mockStoryState = { id: '', text: '', translations: {} }
let mockStoriesState: { isFetchingStory: boolean; error: string | null } = {
  isFetchingStory: false,
  error: null,
}

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}))

jest.mock('../../store/store', () => ({
  useAppSelector: (selector: (state: any) => any) =>
    selector({
      story: mockStoryState,
      stories: mockStoriesState,
    }),
  useAppDispatch: () => mockDispatch,
}))

jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({ t: mockT }),
}))

jest.mock('../../store/storiesSlice', () => ({
  fetchPublicStoryById: (id: string) => ({ type: 'stories/fetchPublicStoryById', payload: id }),
}))

jest.mock('../../store/storySlice', () => ({
  setStoryId: (id: string) => ({ type: 'story/setStoryId', payload: id }),
  setStoryText: (text: string) => ({ type: 'story/setStoryText', payload: text }),
  setTranslations: (translations: Record<string, string>) => ({ type: 'story/setTranslations', payload: translations }),
}))

import { useParams } from 'react-router-dom'
import { usePublicStoryReader } from './usePublicStoryReader'

const mockUseParams = useParams as jest.Mock

describe('usePublicStoryReader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ param: 'test-story-id' })
    mockStoryState = { id: '', text: '', translations: {} }
    mockStoriesState = {
      isFetchingStory: false,
      error: null,
    }
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'test-story-id', story: 'Test story', translations: {} }),
    })
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => usePublicStoryReader())

    expect(result.current.isSignupModalOpen).toBe(false)
    expect(result.current.isWordDrawerOpen).toBe(false)
    expect(result.current.selectedWord).toBeNull()
    expect(result.current.storyText).toBe('')
  })

  it('should dispatch fetchPublicStoryById on mount', () => {
    renderHook(() => usePublicStoryReader())

    expect(mockDispatch).toHaveBeenCalled()
  })

  it('should open word drawer and set selected word on word click', () => {
    const { result } = renderHook(() => usePublicStoryReader())

    const mockEvent = {
      currentTarget: {
        textContent: 'hello',
      },
    } as React.MouseEvent

    act(() => {
      result.current.handleWordClick(mockEvent)
    })

    expect(result.current.isWordDrawerOpen).toBe(true)
    expect(result.current.selectedWord).toBe('hello')
    expect(result.current.isSignupModalOpen).toBe(false)
  })

  it('should close signup modal', () => {
    const { result } = renderHook(() => usePublicStoryReader())

    act(() => {
      result.current.openSignupModal()
    })
    expect(result.current.isSignupModalOpen).toBe(true)

    act(() => {
      result.current.closeSignupModal()
    })
    expect(result.current.isSignupModalOpen).toBe(false)
  })

  it('should expose story text from Redux state', () => {
    mockStoryState = { id: 'story-1', text: 'Hello world', translations: {} }

    const { result } = renderHook(() => usePublicStoryReader())

    expect(result.current.storyText).toBe('Hello world')
  })

  it('should expose fetching state from Redux', () => {
    mockStoriesState = { isFetchingStory: true, error: null }

    const { result } = renderHook(() => usePublicStoryReader())

    expect(result.current.isFetchingStory).toBe(true)
  })

  it('should expose error state from Redux', () => {
    mockStoriesState = { isFetchingStory: false, error: 'Failed to fetch' }

    const { result } = renderHook(() => usePublicStoryReader())

    expect(result.current.storyError).toBe('Failed to fetch')
  })

  it('should close word drawer and clear selected word', () => {
    const { result } = renderHook(() => usePublicStoryReader())

    const mockEvent = {
      currentTarget: {
        textContent: 'world',
      },
    } as React.MouseEvent

    act(() => {
      result.current.handleWordClick(mockEvent)
    })
    expect(result.current.isWordDrawerOpen).toBe(true)
    expect(result.current.selectedWord).toBe('world')

    act(() => {
      result.current.closeWordDrawer()
    })
    expect(result.current.isWordDrawerOpen).toBe(false)
    expect(result.current.selectedWord).toBeNull()
  })

  it('should open signup modal from drawer', () => {
    const { result } = renderHook(() => usePublicStoryReader())

    const mockEvent = {
      currentTarget: {
        textContent: 'test',
      },
    } as React.MouseEvent

    act(() => {
      result.current.handleWordClick(mockEvent)
    })
    expect(result.current.isWordDrawerOpen).toBe(true)
    expect(result.current.isSignupModalOpen).toBe(false)

    act(() => {
      result.current.handleSignupFromDrawer()
    })
    expect(result.current.isWordDrawerOpen).toBe(false)
    expect(result.current.isSignupModalOpen).toBe(true)
  })
})
