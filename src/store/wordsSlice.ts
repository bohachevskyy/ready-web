import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Word } from '../types'

interface WordsState {
  words: Word[]
  wordsCount: number
  countLastFetched: number | null  // Timestamp for cache invalidation
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  lastWordId: string | undefined
  hasNextPage: boolean
  currentIndex: number  // Track current card position
}

const initialState: WordsState = {
  words: [],
  wordsCount: 0,
  countLastFetched: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastWordId: undefined,
  hasNextPage: true,
  currentIndex: 0,
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// Async thunk to fetch initial words
export const fetchWords = createAsyncThunk<
  Word[],
  { limit?: number; afterId?: string },
  { rejectValue: string }
>(
  'words/fetchWords',
  async ({ limit = 15, afterId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any
      const token = state.auth.token

      const params = new URLSearchParams()
      params.append('filter', 'training-due')
      params.append('order', 'desc')
      params.append('limit', limit.toString())
      if (afterId) {
        params.append('afterId', afterId)
      }

      const response = await fetch(`http://localhost:8080/words?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch words')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch words')
    }
  }
)

// Async thunk to fetch words count with caching
export const fetchWordsCount = createAsyncThunk<
  number,
  { force?: boolean },  // Force refetch even if cached
  { rejectValue: string }
>(
  'words/fetchWordsCount',
  async ({ force = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any
      const { countLastFetched, wordsCount } = state.words

      // Check cache - skip fetch if data is fresh (unless forced)
      if (!force && countLastFetched) {
        const timeSinceLastFetch = Date.now() - countLastFetched
        if (timeSinceLastFetch < CACHE_DURATION) {
          // Return cached value
          return wordsCount
        }
      }

      const token = state.auth.token

      const params = new URLSearchParams()
      params.append('filter', 'training-due')
      params.append('order', 'desc')

      const response = await fetch(`http://localhost:8080/words/counts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch words count')
      }

      const data = await response.json()
      return data.count
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch count')
    }
  }
)

// Async thunk to submit review
export const submitWordReview = createAsyncThunk<
  Word,
  { wordId: string; rating: 'again' | 'hard' | 'good' | 'easy' },
  { rejectValue: string }
>(
  'words/submitReview',
  async ({ wordId, rating }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any
      const token = state.auth.token

      const response = await fetch(`http://localhost:8080/words/${wordId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit review')
    }
  }
)

export const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    // Synchronous action to clear words (e.g., on logout or session complete)
    clearWords: (state) => {
      state.words = []
      state.wordsCount = 0
      state.countLastFetched = null
      state.lastWordId = undefined
      state.hasNextPage = true
      state.currentIndex = 0
      state.error = null
    },
    // Move to next word in practice session
    nextWord: (state) => {
      if (state.currentIndex < state.words.length - 1) {
        state.currentIndex += 1
      }
    },
    // Reset to beginning (for new session)
    resetIndex: (state) => {
      state.currentIndex = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch words
      .addCase(fetchWords.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        state.isLoading = false

        // If this is initial load (no words yet), replace array
        // If pagination, append to existing array
        if (state.words.length === 0) {
          state.words = action.payload
        } else {
          state.words = [...state.words, ...action.payload]
        }

        // Update pagination state
        if (action.payload.length > 0) {
          state.lastWordId = action.payload[action.payload.length - 1].id
          state.hasNextPage = action.payload.length === 15
        } else {
          state.hasNextPage = false
        }
      })
      .addCase(fetchWords.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch words'
      })

      // Fetch words count
      .addCase(fetchWordsCount.pending, (state) => {
        state.error = null
      })
      .addCase(fetchWordsCount.fulfilled, (state, action) => {
        state.wordsCount = action.payload
        state.countLastFetched = Date.now()  // Update cache timestamp
      })
      .addCase(fetchWordsCount.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch count'
      })

      // Submit review
      .addCase(submitWordReview.pending, (state) => {
        state.isSubmitting = true
        state.error = null
        // Optimistically decrement count
        if (state.wordsCount > 0) {
          state.wordsCount -= 1
        }
      })
      .addCase(submitWordReview.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Count already decremented optimistically in pending
      })
      .addCase(submitWordReview.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload || 'Failed to submit review'
        // Rollback optimistic update
        state.wordsCount += 1
      })
  },
})

export const { clearWords, nextWord, resetIndex } = wordsSlice.actions

export default wordsSlice.reducer
