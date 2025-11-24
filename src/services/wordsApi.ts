import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '../utils/apiBaseQuery'
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

export interface SubmitReviewRequest {
  wordId: string
  rating: "again" | "hard" | "good" | "easy"
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
    // Mutation to submit a single word review
    submitReview: builder.mutation<Word, SubmitReviewRequest>({
      query: ({ wordId, rating }) => ({
        url: `/words/${wordId}/reviews`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { rating },
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
  useSubmitReviewMutation,
} = wordsApi
