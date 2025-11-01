import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface StoryState {
  id: string
  text: string
  translations: Record<string, string>
}

const initialState: StoryState = {
  id: '',
  text: '',
  translations: {},
}

export const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setStoryId: (state, action: PayloadAction<string>) => {
      state.id = action.payload
    },
    setStoryText: (state, action: PayloadAction<string>) => {
      state.text = action.payload
    },
    setTranslations: (state, action: PayloadAction<Record<string, string>>) => {
      state.translations = action.payload
    },
    clearStory: (state) => {
      state.id = ''
      state.text = ''
      state.translations = {}
    },
  },
})

export const { setStoryId, setStoryText, setTranslations, clearStory } = storySlice.actions

export default storySlice.reducer
