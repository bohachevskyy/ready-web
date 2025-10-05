import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SavedWord, VocabularyState } from '../types'

const initialState: VocabularyState = {
  savedWords: [],
}

export const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    addWord: (state, action: PayloadAction<SavedWord>) => {
      // Only add if word doesn't already exist
      const exists = state.savedWords.find(
        (w) => w.word.toLowerCase() === action.payload.word.toLowerCase()
      )
      if (!exists) {
        state.savedWords.unshift(action.payload)
      }
    },
    removeWord: (state, action: PayloadAction<string>) => {
      state.savedWords = state.savedWords.filter((w) => w.id !== action.payload)
    },
    clearAllWords: (state) => {
      state.savedWords = []
    },
  },
})

export const { addWord, removeWord, clearAllWords } = vocabularySlice.actions

export default vocabularySlice.reducer
