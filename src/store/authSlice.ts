import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: null,
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

// Async thunk for login
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

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    clearToken: (state) => {
      state.token = null
    },
  },
  extraReducers: (builder) => {
    builder
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
  },
})

export const { setToken, clearToken } = authSlice.actions

export default authSlice.reducer
