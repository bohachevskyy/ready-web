import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Stories API service using RTK Query
 * Generates stories based on level and vocabulary words
 */

export interface StoryRequest {
  level: number
  words: string[]
  age_bracket: '8-10'| '11-12' | '13-15' | '16-17' | '18+'
}

export interface StoryResponse {
  story: string
  translations: Record<string, string>
}

export const storiesApi = createApi({
  reducerPath: 'storiesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001' }),
  tagTypes: ['Story'],
  endpoints: (builder) => ({
    // Mutation to generate a story
    generateStory: builder.mutation<StoryResponse, StoryRequest>({
      query: (request) => ({
        url: '/stories',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: request,
      }),
      invalidatesTags: ['Story'],
    }),
  }),
})

// Export hooks for usage in functional components
export const { useGenerateStoryMutation } = storiesApi
