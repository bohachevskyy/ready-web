import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Word, WordReview, WordsCountResponse } from '../types'

/**
 * Words API service using RTK Query
 * Handles fetching training-due words and submitting reviews
 */

export interface GetWordsParams {
  filter?: string
  order?: string
  afterId?: string
  limit?: number
}

export interface GetWordsCountParams {
  filter?: string
  order?: string
}

export interface SubmitReviewsRequest {
  reviews: WordReview[]
}

// Custom baseQuery that handles authentication from Redux state
const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const state = api.getState() as any
  const token = state.auth.token

  // Create base query with token from Redux state
  const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  })

  // Execute the actual request
  const result = await baseQuery(args, api, extraOptions)

  // Handle 401 Unauthorized errors
  if (result.error && result.error.status === 401) {
    console.error('Authentication error: token expired or invalid')
  }

  return result
}

export const wordsApi = createApi({
  reducerPath: 'wordsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Words'],
  endpoints: (builder) => ({
    // Query to get training-due words
    getWords: builder.query<Word[], GetWordsParams>({
      query: ({ filter = 'training-due', order = 'desc', afterId, limit = 15 }) => {
        const params = new URLSearchParams()
        params.append('filter', filter)
        params.append('order', order)
        if (afterId) {
          params.append('afterId', afterId)
        }
        params.append('limit', limit.toString())
        return `/words?${params.toString()}`
      },
      providesTags: ['Words'],
    }),
    // Query to get count of training-due words
    getWordsCount: builder.query<WordsCountResponse, GetWordsCountParams>({
      query: ({ filter = 'training-due', order = 'desc' }) => {
        const params = new URLSearchParams()
        params.append('filter', filter)
        params.append('order', order)
        return `/words/counts?${params.toString()}`
      },
      providesTags: ['Words'],
    }),
    // Mutation to submit batch word reviews
    submitReviews: builder.mutation<void, SubmitReviewsRequest>({
      query: (body) => ({
        url: '/words/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      invalidatesTags: ['Words'],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetWordsQuery,
  useLazyGetWordsQuery,
  useGetWordsCountQuery,
  useSubmitReviewsMutation,
} = wordsApi
