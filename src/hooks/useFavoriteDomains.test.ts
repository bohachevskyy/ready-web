import { act, renderHook } from '@testing-library/react'

const mockDispatch = jest.fn()

let mockState = {
  categories: {
    categories: [
      {
        id: 'cat-1',
        name: 'fiction',
        title: 'Fiction',
        description: '',
        icon: '',
        order: 1,
        domains: [
          { id: 'd-1', name: 'history', title: 'History', description: 'Past events', icon: 'book', order: 1 },
          { id: 'd-2', name: 'space', title: 'Space', description: 'Planets', icon: 'rocket', order: 2 },
        ],
      },
      {
        id: 'cat-2',
        name: 'science',
        title: 'Science',
        description: '',
        icon: '',
        order: 2,
        domains: [
          { id: 'd-3', name: 'biology', title: 'Biology', description: 'Life', icon: 'leaf', order: 1 },
        ],
      },
    ],
    userFavoriteDomainIds: ['d-1', 'd-3'],
    hasLoadedUserFavorites: true,
    isLoading: false,
  },
}

const mockAddFavoriteDomain = jest.fn((domainId: string) => ({
  type: 'categories/addFavoriteDomain',
  payload: domainId,
}))

const mockRemoveFavoriteDomain = jest.fn((domainId: string) => ({
  type: 'categories/removeFavoriteDomain',
  payload: domainId,
}))

const mockFetchUserFavorites = jest.fn(() => ({
  type: 'categories/fetchUserFavorites',
}))

jest.mock('../store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}))

jest.mock('../store/categoriesSlice', () => ({
  addFavoriteDomain: (domainId: string) => mockAddFavoriteDomain(domainId),
  removeFavoriteDomain: (domainId: string) => mockRemoveFavoriteDomain(domainId),
  fetchUserFavorites: () => mockFetchUserFavorites(),
}))

import { useFavoriteDomains } from './useFavoriteDomains'

describe('useFavoriteDomains', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockState = {
      categories: {
        categories: [
          {
            id: 'cat-1',
            name: 'fiction',
            title: 'Fiction',
            description: '',
            icon: '',
            order: 1,
            domains: [
              { id: 'd-1', name: 'history', title: 'History', description: 'Past events', icon: 'book', order: 1 },
              { id: 'd-2', name: 'space', title: 'Space', description: 'Planets', icon: 'rocket', order: 2 },
            ],
          },
          {
            id: 'cat-2',
            name: 'science',
            title: 'Science',
            description: '',
            icon: '',
            order: 2,
            domains: [
              { id: 'd-3', name: 'biology', title: 'Biology', description: 'Life', icon: 'leaf', order: 1 },
            ],
          },
        ],
        userFavoriteDomainIds: ['d-1', 'd-3'],
        hasLoadedUserFavorites: true,
        isLoading: false,
      },
    }
  })

  it('toggleFavoriteDomain dispatches remove thunk for favorited domain and add thunk for non-favorited domain', () => {
    const { result } = renderHook(() => useFavoriteDomains())

    act(() => {
      result.current.toggleFavoriteDomain('d-1')
    })

    expect(mockRemoveFavoriteDomain).toHaveBeenCalledWith('d-1')
    expect(mockDispatch).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.toggleFavoriteDomain('d-2')
    })

    expect(mockAddFavoriteDomain).toHaveBeenCalledWith('d-2')
    expect(mockDispatch).toHaveBeenCalledTimes(2)
  })

  it('isFavorite returns correct boolean', () => {
    const { result } = renderHook(() => useFavoriteDomains())

    expect(result.current.isFavorite('d-1')).toBe(true)
    expect(result.current.isFavorite('d-2')).toBe(false)
  })

  it('computes userFavoriteDomains from categories and favorite ids', () => {
    const { result } = renderHook(() => useFavoriteDomains())

    expect(result.current.userFavoriteDomains.map((domain) => domain.id)).toEqual(['d-1', 'd-3'])
    expect(result.current.userFavoriteDomains.map((domain) => domain.title)).toEqual(['History', 'Biology'])
  })
})
