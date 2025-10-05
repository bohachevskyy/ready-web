import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface StoryState {
  text: string
  translations: Record<string, string>
}

const initialState: StoryState = {
  text: '',
  translations: {},
}

export const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setStoryText: (state, action: PayloadAction<string>) => {
      state.text = action.payload
    },
    setTranslations: (state, action: PayloadAction<Record<string, string>>) => {
      state.translations = action.payload
    },
    clearStory: (state) => {
      state.text = ''
      state.translations = {}
    },
  },
})

export const { setStoryText, setTranslations, clearStory } = storySlice.actions

export default storySlice.reducer
