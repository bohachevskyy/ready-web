import { configureStore } from '@reduxjs/toolkit'
import categoriesReducer, { fetchCategories, addFavoriteDomain, removeFavoriteDomain } from './categoriesSlice'

// Mock fetchWithAuth
jest.mock('../utils/fetchWithAuth', () => ({
  fetchWithAuth: jest.fn(),
}))

import { fetchWithAuth } from '../utils/fetchWithAuth'

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

function createTestStore() {
  return configureStore({
    reducer: { categories: categoriesReducer },
  })
}

const mockCategoriesResponse = {
  categories: [
    { id: 'cat-1', name: 'Nonfiction', description: 'Educational stories', sort_order: 0 },
    { id: 'cat-2', name: 'Fiction', description: 'Creative stories', sort_order: 1 },
    { id: 'cat-3', name: 'Teen', sort_order: 2 },
  ],
  count: 3,
}

const mockDomainsResponse = {
  domains: [
    { id: 'dom-1', slug: 'history', name: 'History', description: 'Historical events', category_id: 'cat-1', sort_order: 0 },
    { id: 'dom-2', slug: 'biology', name: 'Biology', description: 'Life sciences', category_id: 'cat-1', sort_order: 1 },
    { id: 'dom-3', slug: 'adventure_quest', name: 'Adventure Quest', description: 'Journeys', category_id: 'cat-2', sort_order: 0 },
    { id: 'dom-4', slug: 'teen_friendship', name: 'Friendship', description: 'Making friends', category_id: 'cat-3', sort_order: 0 },
  ],
  count: 4,
}

function mockSuccessfulFetch() {
  mockFetchWithAuth
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockCategoriesResponse) } as Response)
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockDomainsResponse) } as Response)
}

describe('fetchCategories thunk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch both /categories and /categories/domains endpoints', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(2)
    expect(mockFetchWithAuth).toHaveBeenCalledWith(expect.stringContaining('/categories'))
    expect(mockFetchWithAuth).toHaveBeenCalledWith(expect.stringContaining('/categories/domains'))
  })

  it('should lowercase category names for visibility matching', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { categories } = store.getState().categories
    expect(categories[0].name).toBe('nonfiction')
    expect(categories[1].name).toBe('fiction')
    expect(categories[2].name).toBe('teen')
  })

  it('should preserve original category name as title', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { categories } = store.getState().categories
    expect(categories[0].title).toBe('Nonfiction')
    expect(categories[1].title).toBe('Fiction')
    expect(categories[2].title).toBe('Teen')
  })

  it('should map domain slug to name for navigation', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { categories } = store.getState().categories
    const nonfiction = categories.find(c => c.name === 'nonfiction')!
    expect(nonfiction.domains[0].name).toBe('history')
    expect(nonfiction.domains[1].name).toBe('biology')
  })

  it('should map domain name to title for display', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { categories } = store.getState().categories
    const nonfiction = categories.find(c => c.name === 'nonfiction')!
    expect(nonfiction.domains[0].title).toBe('History')
    expect(nonfiction.domains[1].title).toBe('Biology')
  })

  it('should map sort_order to order', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { categories } = store.getState().categories
    expect(categories[0].order).toBe(0)
    expect(categories[1].order).toBe(1)
    expect(categories[0].domains[0].order).toBe(0)
    expect(categories[0].domains[1].order).toBe(1)
  })

  it('should group domains by category_id', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { categories } = store.getState().categories
    const nonfiction = categories.find(c => c.name === 'nonfiction')!
    const fiction = categories.find(c => c.name === 'fiction')!
    const teen = categories.find(c => c.name === 'teen')!

    expect(nonfiction.domains).toHaveLength(2)
    expect(fiction.domains).toHaveLength(1)
    expect(teen.domains).toHaveLength(1)
  })

  it('should default missing description to empty string', async () => {
    mockSuccessfulFetch()
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { categories } = store.getState().categories
    const teen = categories.find(c => c.name === 'teen')!
    expect(teen.description).toBe('')
  })

  it('should set error state when API fails', async () => {
    mockFetchWithAuth.mockRejectedValueOnce(new Error('Network error'))
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { error, isLoading } = store.getState().categories
    expect(error).toBe('Network error')
    expect(isLoading).toBe(false)
  })

  it('should set error when categories response is not ok', async () => {
    mockFetchWithAuth
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockDomainsResponse) } as Response)
    const store = createTestStore()

    await store.dispatch(fetchCategories())

    const { error } = store.getState().categories
    expect(error).toBe('Failed to fetch categories')
  })
})

describe('addFavoriteDomain thunk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should optimistically add domain id on pending without setting isLoading', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as Response)
    const store = createTestStore()

    const promise = store.dispatch(addFavoriteDomain('dom-1'))

    // Check state immediately after dispatch (pending)
    const pendingState = store.getState().categories
    expect(pendingState.userFavoriteDomainIds).toContain('dom-1')
    expect(pendingState.isLoading).toBe(false)

    await promise
  })

  it('should revert optimistic add on rejection', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: false } as Response)
    const store = createTestStore()

    await store.dispatch(addFavoriteDomain('dom-1'))

    const state = store.getState().categories
    expect(state.userFavoriteDomainIds).not.toContain('dom-1')
    expect(state.error).toBe('Failed to add favorite domain')
  })
})

describe('removeFavoriteDomain thunk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should optimistically remove domain id on pending without setting isLoading', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as Response)
    const store = configureStore({
      reducer: { categories: categoriesReducer },
      preloadedState: {
        categories: {
          categories: [],
          favoriteDomains: [],
          userFavoriteDomainIds: ['dom-1', 'dom-2'],
          hasLoadedUserFavorites: true,
          isLoading: false,
          error: null,
        },
      },
    })

    const promise = store.dispatch(removeFavoriteDomain('dom-1'))

    const pendingState = store.getState().categories
    expect(pendingState.userFavoriteDomainIds).not.toContain('dom-1')
    expect(pendingState.userFavoriteDomainIds).toContain('dom-2')
    expect(pendingState.isLoading).toBe(false)

    await promise
  })

  it('should revert optimistic remove on rejection', async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: false } as Response)
    const store = configureStore({
      reducer: { categories: categoriesReducer },
      preloadedState: {
        categories: {
          categories: [],
          favoriteDomains: [],
          userFavoriteDomainIds: ['dom-1', 'dom-2'],
          hasLoadedUserFavorites: true,
          isLoading: false,
          error: null,
        },
      },
    })

    await store.dispatch(removeFavoriteDomain('dom-1'))

    const state = store.getState().categories
    expect(state.userFavoriteDomainIds).toContain('dom-1')
    expect(state.error).toBe('Failed to remove favorite domain')
  })
})
