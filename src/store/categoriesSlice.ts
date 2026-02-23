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

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/domains`)

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data: Category[] = await response.json()
      return data
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
