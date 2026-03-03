import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface StoryState {
  id: string
  text: string
  title: string
  translations: Record<string, string>
}

const initialState: StoryState = {
  id: '',
  text: '',
  title: '',
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
    setStoryTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    setTranslations: (state, action: PayloadAction<Record<string, string>>) => {
      state.translations = action.payload
    },
    clearStory: (state) => {
      state.id = ''
      state.text = ''
      state.title = ''
      state.translations = {}
    },
  },
})

export const { setStoryId, setStoryText, setStoryTitle, setTranslations, clearStory } = storySlice.actions

export default storySlice.reducer
