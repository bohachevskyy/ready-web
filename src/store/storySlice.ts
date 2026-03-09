import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface StoryState {
  id: string
  text: string
  title: string
  translations: Record<string, string>
  domain: string
}

const initialState: StoryState = {
  id: '',
  text: '',
  title: '',
  translations: {},
  domain: '',
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
    setStoryDomain: (state, action: PayloadAction<string>) => {
      state.domain = action.payload
    },
    clearStory: (state) => {
      state.id = ''
      state.text = ''
      state.title = ''
      state.translations = {}
      state.domain = ''
    },
  },
})

export const { setStoryId, setStoryText, setStoryTitle, setTranslations, setStoryDomain, clearStory } = storySlice.actions

export default storySlice.reducer
