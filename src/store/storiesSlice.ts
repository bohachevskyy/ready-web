import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchWithAuth } from '../utils/fetchWithAuth'

// Story types
export interface StoryRequest {
  level: number
  words: string[]
  age_bracket: '8-10' | '11-12' | '13-15' | '16-17' | '18+'
  domain?: string
}

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

export interface StoryResponse {
  id: string
  story: string
  translations: Record<string, string>
}

// Questions types
export interface Question {
  id: string
  text: string
  options: string[]
  correct_answer: number
}

export interface QuestionsResponse {
  questions: Question[]
}

// Feedback types
export interface FeedbackRequest {
  start_time: string
  end_time: string
  is_skipped: boolean
  question_attempts: number[]
  is_liked: boolean
  is_disliked: boolean
  feedback_text: string
}

// Word details types
export interface WordDetailsResponse {
  expression: string
  translation: string
  grammatical_info: string
  sentence_translation: string
  example_sentence: string
}

// Save words types
export interface SaveWordRequest {
  word: string
  translation?: string
  sentence_context?: string
  sentence_example?: string
  story_id?: string
}

export interface SaveWordsRequest {
  words: SaveWordRequest[]
}

interface StoriesState {
  currentStory: StoryResponse | null
  questions: Question[]
  wordDetails: WordDetailsResponse | null
  isGeneratingStory: boolean
  isLoadingQuestions: boolean
  isLoadingWordDetails: boolean
  isSavingWords: boolean
  isSubmittingFeedback: boolean
  error: string | null
}

const initialState: StoriesState = {
  currentStory: null,
  questions: [],
  wordDetails: null,
  isGeneratingStory: false,
  isLoadingQuestions: false,
  isLoadingWordDetails: false,
  isSavingWords: false,
  isSubmittingFeedback: false,
  error: null,
}

// Async thunk to generate a story
export const generateStory = createAsyncThunk<StoryResponse, StoryRequest, { rejectValue: string }>(
  'stories/generateStory',
  async (request, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth('http://localhost:8080/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Failed to generate story')
      }

      const data: ApiStoryResponse = await response.json()

      // Transform response
      return {
        id: data.id,
        story: data.text,
        translations: data.translation,
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate story')
    }
  }
)

// Async thunk to get questions
export const getQuestions = createAsyncThunk<QuestionsResponse, string, { rejectValue: string }>(
  'stories/getQuestions',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/stories/${storyId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get questions')
      }

      const data: Array<{
        id: string
        story_id: string
        text: string
        options: Array<{ text: string; is_correct: boolean }>
        created_at: string
      }> = await response.json()

      // Transform response
      return {
        questions: data.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options.map(opt => opt.text),
          correct_answer: q.options.findIndex(opt => opt.is_correct),
        })),
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get questions')
    }
  }
)

// Async thunk to submit feedback
export const submitFeedback = createAsyncThunk<
  void,
  { storyId: string; feedback: FeedbackRequest },
  { rejectValue: string }
>(
  'stories/submitFeedback',
  async ({ storyId, feedback }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/stories/${storyId}/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      return
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit feedback')
    }
  }
)

// Async thunk to get word details
export const getWordDetails = createAsyncThunk<
  WordDetailsResponse,
  { storyId: string; start: number; end: number },
  { rejectValue: string }
>(
  'stories/getWordDetails',
  async ({ storyId, start, end }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/stories/${storyId}/words?start=${start}&end=${end}`
      )

      if (!response.ok) {
        throw new Error('Failed to get word details')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get word details')
    }
  }
)

// Async thunk to save words
export const saveWords = createAsyncThunk<void, SaveWordsRequest, { rejectValue: string }>(
  'stories/saveWords',
  async (request, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth('http://localhost:8080/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Failed to save words')
      }

      return
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save words')
    }
  }
)

export const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    clearStory: (state) => {
      state.currentStory = null
      state.questions = []
      state.wordDetails = null
      state.error = null
    },
    clearWordDetails: (state) => {
      state.wordDetails = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate story
      .addCase(generateStory.pending, (state) => {
        state.isGeneratingStory = true
        state.error = null
      })
      .addCase(generateStory.fulfilled, (state, action) => {
        state.isGeneratingStory = false
        state.currentStory = action.payload
      })
      .addCase(generateStory.rejected, (state, action) => {
        state.isGeneratingStory = false
        state.error = action.payload || 'Failed to generate story'
      })

      // Get questions
      .addCase(getQuestions.pending, (state) => {
        state.isLoadingQuestions = true
        state.error = null
      })
      .addCase(getQuestions.fulfilled, (state, action) => {
        state.isLoadingQuestions = false
        state.questions = action.payload.questions
      })
      .addCase(getQuestions.rejected, (state, action) => {
        state.isLoadingQuestions = false
        state.error = action.payload || 'Failed to get questions'
      })

      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.isSubmittingFeedback = true
        state.error = null
      })
      .addCase(submitFeedback.fulfilled, (state) => {
        state.isSubmittingFeedback = false
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isSubmittingFeedback = false
        state.error = action.payload || 'Failed to submit feedback'
      })

      // Get word details
      .addCase(getWordDetails.pending, (state) => {
        state.isLoadingWordDetails = true
        state.error = null
      })
      .addCase(getWordDetails.fulfilled, (state, action) => {
        state.isLoadingWordDetails = false
        state.wordDetails = action.payload
      })
      .addCase(getWordDetails.rejected, (state, action) => {
        state.isLoadingWordDetails = false
        state.error = action.payload || 'Failed to get word details'
      })

      // Save words
      .addCase(saveWords.pending, (state) => {
        state.isSavingWords = true
        state.error = null
      })
      .addCase(saveWords.fulfilled, (state) => {
        state.isSavingWords = false
      })
      .addCase(saveWords.rejected, (state, action) => {
        state.isSavingWords = false
        state.error = action.payload || 'Failed to save words'
      })
  },
})

export const { clearStory, clearWordDetails } = storiesSlice.actions

export default storiesSlice.reducer
