import { createApi } from '@reduxjs/toolkit/query/react'
import { getMockTranslation, Translation } from '../mocks/translationData'

/**
 * Translation API service using RTK Query
 * Currently uses mock data, but structured to easily swap for real API
 */

// Mock base query that simulates network delay
const mockBaseQuery = async (args: any) => {

  if (typeof args === 'string' || args.url) {
    const url = typeof args === 'string' ? args : args.url

    // Parse the word from the URL
    const urlParams = new URLSearchParams(url.split('?')[1])
    const word = urlParams.get('word')

    if (!word) {
      return {
        error: {
          status: 400,
          data: { message: 'Word parameter is required' },
        },
      }
    }

    try {
      const translation = getMockTranslation(word)
      return { data: translation }
    } catch (error) {
      return {
        error: {
          status: 500,
          data: { message: 'Translation failed' },
        },
      }
    }
  }

  return {
    error: {
      status: 400,
      data: { message: 'Invalid request' },
    },
  }
}

export const translationApi = createApi({
  reducerPath: 'translationApi',
  // When ready for production, replace mockBaseQuery with:
  // baseQuery: fetchBaseQuery({ baseUrl: 'https://api.yourdomain.com' }),
  baseQuery: mockBaseQuery as any,
  tagTypes: ['Translation'],
  endpoints: (builder) => ({
    // Query to translate a word
    translateWord: builder.query<Translation, string>({
      query: (word) => `/translate?word=${encodeURIComponent(word)}`,
      // Cache translations for 5 minutes
      keepUnusedDataFor: 300,
    }),
  }),
})

// Export hooks for usage in functional components
export const { useTranslateWordQuery, useLazyTranslateWordQuery } = translationApi

// Export util to prefetch translations
export const { util: translationApiUtil } = translationApi
