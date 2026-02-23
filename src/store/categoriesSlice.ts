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
  isLoading: boolean
  error: string | null
}

const initialState: CategoriesState = {
  categories: [],
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

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
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
      const domainsData: { domains: ApiDomain[] } = await domainsResponse.json()

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

      return categoriesData.categories.map((apiCategory): Category => ({
        id: apiCategory.id,
        name: apiCategory.name.toLowerCase(),
        title: apiCategory.name,
        description: apiCategory.description || '',
        icon: '',
        order: apiCategory.sort_order,
        domains: domainsByCategory.get(apiCategory.id) || [],
      }))
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch categories')
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
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch categories'
      })
  },
})

export default categoriesSlice.reducer
