import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  firebase_uid: string
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
  name?: string
  age?: number
  language_level?: number
}

interface AuthState {
  token: string | null
  tokenExpiresAt: string | null
  refreshToken: string | null
  refreshTokenExpiresAt: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: null,
  tokenExpiresAt: null,
  refreshToken: null,
  refreshTokenExpiresAt: null,
  user: null,
  isLoading: false,
  error: null,
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface FirebaseAuthRequest {
  firebase_token: string
}

export interface FirebaseAuthResponse {
  access_token: string
  access_token_expires_at: string
  refresh_token: string
  refresh_token_expires_at: string
  user: User
}

// Async thunk for traditional login
export const login = createAsyncThunk<LoginResponse, LoginRequest>(
  'auth/login',
  async (credentials) => {
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const data = await response.json()
    return data
  }
)

// Async thunk for Firebase authentication
export const loginWithFirebase = createAsyncThunk<FirebaseAuthResponse, FirebaseAuthRequest>(
  'auth/loginWithFirebase',
  async (request) => {
    const response = await fetch('http://localhost:8080/auth/firebase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_token: request.firebase_token
      }),
    })

    if (!response.ok) {
      throw new Error('Firebase authentication failed')
    }

    const data = await response.json()
    return data
  }
)

// Async thunk for refreshing access token
export const refreshAccessToken = createAsyncThunk<FirebaseAuthResponse, string>(
  'auth/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue('Failed to refresh token')
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    updateUserLanguageLevel: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.language_level = action.payload
      }
    },
    clearAuth: (state) => {
      state.token = null
      state.tokenExpiresAt = null
      state.refreshToken = null
      state.refreshTokenExpiresAt = null
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Traditional login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.access_token
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Login failed'
      })
      // Firebase login
      .addCase(loginWithFirebase.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginWithFirebase.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.access_token
        state.tokenExpiresAt = action.payload.access_token_expires_at
        state.refreshToken = action.payload.refresh_token
        state.refreshTokenExpiresAt = action.payload.refresh_token_expires_at
        state.user = action.payload.user
      })
      .addCase(loginWithFirebase.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Firebase authentication failed'
      })
      // Refresh token
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.access_token
        state.tokenExpiresAt = action.payload.access_token_expires_at
        state.refreshToken = action.payload.refresh_token
        state.refreshTokenExpiresAt = action.payload.refresh_token_expires_at
        state.user = action.payload.user
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isLoading = false
        state.token = null
        state.tokenExpiresAt = null
        state.refreshToken = null
        state.refreshTokenExpiresAt = null
        state.user = null
        state.error = 'Session expired. Please login again.'
      })
  },
})

export const { setToken, setUser, updateUserLanguageLevel, clearAuth } = authSlice.actions

export default authSlice.reducer
