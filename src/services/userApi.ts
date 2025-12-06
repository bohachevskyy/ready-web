import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '../utils/apiBaseQuery'

/**
 * User API service using RTK Query
 * Handles user profile updates
 */

// Import User type from authSlice
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
  birth_month?: number
  birth_year?: number
  learning_language?: string
}

export interface UpdateLanguageLevelRequest {
  language_level: number
}

export interface UpdateUserProfileRequest {
  birth_month?: number
  birth_year?: number
  learning_language?: string
  language_level?: number
}

export interface UpdateUserProfileResponse {
  user: User
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUserProfile: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    updateLanguageLevel: builder.mutation<void, UpdateLanguageLevelRequest>({
      query: (body) => ({
        url: '/users',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserProfile: builder.mutation<UpdateUserProfileResponse, UpdateUserProfileRequest>({
      query: (body) => ({
        url: '/users',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

// Export hooks for usage in functional components
export const { useGetUserProfileQuery, useUpdateLanguageLevelMutation, useUpdateUserProfileMutation } = userApi
