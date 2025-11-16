import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '../utils/apiBaseQuery'

/**
 * User API service using RTK Query
 * Handles user profile updates
 */

export interface UpdateLanguageLevelRequest {
  language_level: number
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
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
  }),
})

// Export hooks for usage in functional components
export const { useUpdateLanguageLevelMutation } = userApi
