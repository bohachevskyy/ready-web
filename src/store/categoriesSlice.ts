import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchWithAuth } from '../utils/fetchWithAuth'
import { API_BASE_URL } from '../config/api'

export interface Domain {
  id: string
  name: string
  title: string
  description: string
  icon: string
  order: number
}

export interface Category {
  id: string
  name: string
  title: string
  description: string
  icon: string
  order: number
  domains: Domain[]
}

interface CategoriesState {
  categories: Category[]
  favoriteDomains: Domain[]
  userFavoriteDomainIds: string[]
  hasLoadedUserFavorites: boolean
  isLoading: boolean
  error: string | null
}

const initialState: CategoriesState = {
  categories: [],
  favoriteDomains: [],
  userFavoriteDomainIds: [],
  hasLoadedUserFavorites: false,
  isLoading: false,
  error: null,
}

interface ApiCategory {
  id: string
  name: string
  description?: string
  sort_order: number
}

interface ApiDomain {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  category_id: string
  sort_order: number
}

interface FetchCategoriesResult {
  categories: Category[]
  favoriteDomains: Domain[]
}

interface FetchUserFavoritesResponse {
  domains: ApiDomain[]
  count: number
}

export const fetchCategories = createAsyncThunk<FetchCategoriesResult, void, { rejectValue: string }>(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const [categoriesResponse, domainsResponse] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/categories`),
        fetchWithAuth(`${API_BASE_URL}/categories/domains`),
      ])

      if (!categoriesResponse.ok || !domainsResponse.ok) {
        throw new Error('Failed to fetch categories')
      }

      const categoriesData: { categories: ApiCategory[] } = await categoriesResponse.json()
      const domainsData: { domains: ApiDomain[]; favorite?: ApiDomain[] } = await domainsResponse.json()

      const domainsByCategory = new Map<string, Domain[]>()
      for (const apiDomain of domainsData.domains) {
        const domain: Domain = {
          id: apiDomain.id,
          name: apiDomain.slug,
          title: apiDomain.name,
          description: apiDomain.description || '',
          icon: apiDomain.icon || '',
          order: apiDomain.sort_order,
        }
        const existing = domainsByCategory.get(apiDomain.category_id) || []
        existing.push(domain)
        domainsByCategory.set(apiDomain.category_id, existing)
      }

      const favoriteDomains: Domain[] = (domainsData.favorite || []).map((apiDomain) => ({
        id: apiDomain.id,
        name: apiDomain.slug,
        title: apiDomain.name,
        description: apiDomain.description || '',
        icon: apiDomain.icon || '',
        order: apiDomain.sort_order,
      }))

      const categories = categoriesData.categories.map((apiCategory): Category => ({
        id: apiCategory.id,
        name: apiCategory.name.toLowerCase(),
        title: apiCategory.name,
        description: apiCategory.description || '',
        icon: '',
        order: apiCategory.sort_order,
        domains: domainsByCategory.get(apiCategory.id) || [],
      }))

      return { categories, favoriteDomains }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch categories')
    }
  }
)

export const fetchUserFavorites = createAsyncThunk<string[], void, { rejectValue: string }>(
  'categories/fetchUserFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/domains/favorites`)

      if (!response.ok) {
        throw new Error('Failed to fetch user favorites')
      }

      const data: FetchUserFavoritesResponse = await response.json()
      return data.domains.map((domain) => domain.id)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user favorites')
    }
  }
)

export const addFavoriteDomain = createAsyncThunk<string, string, { rejectValue: string }>(
  'categories/addFavoriteDomain',
  async (domainId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/domains/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain_id: domainId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add favorite domain')
      }

      return domainId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add favorite domain')
    }
  }
)

export const removeFavoriteDomain = createAsyncThunk<string, string, { rejectValue: string }>(
  'categories/removeFavoriteDomain',
  async (domainId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/domains/favorites/${domainId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite domain')
      }

      return domainId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove favorite domain')
    }
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload.categories
        state.favoriteDomains = action.payload.favoriteDomains
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch categories'
      })
      .addCase(fetchUserFavorites.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.isLoading = false
        state.hasLoadedUserFavorites = true
        state.userFavoriteDomainIds = action.payload
      })
      .addCase(fetchUserFavorites.rejected, (state, action) => {
        state.isLoading = false
        state.hasLoadedUserFavorites = true
        state.error = action.payload || 'Failed to fetch user favorites'
      })
      .addCase(addFavoriteDomain.pending, (state, action) => {
        state.error = null
        if (!state.userFavoriteDomainIds.includes(action.meta.arg)) {
          state.userFavoriteDomainIds.push(action.meta.arg)
        }
      })
      .addCase(addFavoriteDomain.fulfilled, () => {
        // State already updated optimistically in pending
      })
      .addCase(addFavoriteDomain.rejected, (state, action) => {
        state.userFavoriteDomainIds = state.userFavoriteDomainIds.filter((id) => id !== action.meta.arg)
        state.error = action.payload || 'Failed to add favorite domain'
      })
      .addCase(removeFavoriteDomain.pending, (state, action) => {
        state.error = null
        state.userFavoriteDomainIds = state.userFavoriteDomainIds.filter((id) => id !== action.meta.arg)
      })
      .addCase(removeFavoriteDomain.fulfilled, () => {
        // State already updated optimistically in pending
      })
      .addCase(removeFavoriteDomain.rejected, (state, action) => {
        state.userFavoriteDomainIds.push(action.meta.arg)
        state.error = action.payload || 'Failed to remove favorite domain'
      })
  },
})

export default categoriesSlice.reducer
