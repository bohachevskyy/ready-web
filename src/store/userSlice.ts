import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchWithAuth } from '../utils/fetchWithAuth'
import { API_BASE_URL } from '../config/api'

// User type (matches the one in authSlice)
interface User {
  id: string
  email: string
  firebase_uid: string
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
  name?: string
  language_level?: number
  birth_month?: number
  birth_year?: number
  native_language?: string
}

interface UserState {
  profile: User | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
}

export interface UpdateLanguageLevelRequest {
  language_level: number
}

export interface UpdateUserProfileRequest {
  birth_month?: number
  birth_year?: number
  native_language?: string
  language_level?: number
}

export interface UpdateUserProfileResponse {
  user: User
}

// Async thunk to get user profile
export const getUserProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/auth/me`)

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user profile')
    }
  }
)

// Async thunk to update language level
export const updateLanguageLevel = createAsyncThunk<
  void,
  UpdateLanguageLevelRequest,
  { rejectValue: string }
>(
  'user/updateLanguageLevel',
  async (body, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to update language level')
      }

      return
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update language level')
    }
  }
)

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk<
  UpdateUserProfileResponse,
  UpdateUserProfileRequest,
  { rejectValue: string }
>(
  'user/updateUserProfile',
  async (body, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to update user profile')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user profile')
    }
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch user profile'
      })

      // Update language level
      .addCase(updateLanguageLevel.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateLanguageLevel.fulfilled, (state) => {
        state.isUpdating = false
        // Refetch profile after update
      })
      .addCase(updateLanguageLevel.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload || 'Failed to update language level'
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false
        state.profile = action.payload.user
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload || 'Failed to update user profile'
      })
  },
})

export const { clearUserProfile } = userSlice.actions

export default userSlice.reducer
