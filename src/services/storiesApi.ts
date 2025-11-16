import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '../utils/apiBaseQuery'

/**
 * Stories API service using RTK Query
 * Generates stories based on level and vocabulary words
 */

export interface StoryRequest {
  level: number
  words: string[]
  age_bracket: '8-10'| '11-12' | '13-15' | '16-17' | '18+'
  domain?: string
}

// API response from backend
interface ApiStoryResponse {
  id: string
  user_id: string
  text: string
  translation: Record<string, string>
  difficulty_level: number
  age_bracket: string
  original_language: string
  translated_language: string
  tags: string[]
  created_at: string
}

// Transformed response for frontend
export interface StoryResponse {
  id: string
  story: string
  translations: Record<string, string>
}

// Questions API types
export interface Question {
  id: string
  text: string
  options: string[]
  correct_answer: number
}

export interface QuestionsResponse {
  questions: Question[]
}

// Feedback API types
export interface FeedbackRequest {
  start_time: string
  end_time: string
  is_skipped: boolean
  question_attempts: number[]
  is_liked: boolean
  is_disliked: boolean
  feedback_text: string
}

// Word details API types
export interface WordDetailsResponse {
  expression: string
  translation: string
  grammatical_info: string
  sentence_translation: string
  example_sentence: string
}

export const storiesApi = createApi({
  reducerPath: 'storiesApi',
  baseQuery: baseQueryWithAuth,
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
      // Transform API response to match frontend expectations
      transformResponse: (response: ApiStoryResponse): StoryResponse => ({
        id: response.id,
        story: response.text,
        translations: response.translation,
      }),
      invalidatesTags: ['Story'],
    }),
    // Get questions for a story
    getQuestions: builder.mutation<QuestionsResponse, string>({
      query: (storyId) => ({
        url: `/stories/${storyId}/questions`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      // Transform API response to match frontend expectations
      transformResponse: (response: Array<{
        id: string
        story_id: string
        text: string
        options: Array<{ text: string; is_correct: boolean }>
        created_at: string
      }>): QuestionsResponse => ({
        questions: response.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options.map(opt => opt.text),
          correct_answer: q.options.findIndex(opt => opt.is_correct),
        })),
      }),
    }),
    // Submit feedback for a story
    submitFeedback: builder.mutation<void, { storyId: string; feedback: FeedbackRequest }>({
      query: ({ storyId, feedback }) => ({
        url: `/stories/${storyId}/feedbacks`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: feedback,
      }),
    }),
    // Get word details with context
    getWordDetails: builder.query<WordDetailsResponse, { storyId: string; start: number; end: number }>({
      query: ({ storyId, start, end }) => ({
        url: `/stories/${storyId}/words?start=${start}&end=${end}`,
        method: 'GET',
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGenerateStoryMutation,
  useGetQuestionsMutation,
  useSubmitFeedbackMutation,
  useLazyGetWordDetailsQuery
} = storiesApi
