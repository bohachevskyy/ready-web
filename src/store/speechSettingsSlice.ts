import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SpeechSettingsState {
  autoPlayEnabled: boolean
  speechRate: number
  selectedVoice: string | null
}

const initialState: SpeechSettingsState = {
  autoPlayEnabled: true,
  speechRate: 1.0,
  selectedVoice: null,
}

const speechSettingsSlice = createSlice({
  name: 'speechSettings',
  initialState,
  reducers: {
    toggleAutoPlay: (state) => {
      state.autoPlayEnabled = !state.autoPlayEnabled
    },
    setSpeechRate: (state, action: PayloadAction<number>) => {
      // Clamp speech rate between 0.5 and 2.0
      state.speechRate = Math.max(0.5, Math.min(2.0, action.payload))
    },
    setSelectedVoice: (state, action: PayloadAction<string | null>) => {
      state.selectedVoice = action.payload
    },
  },
})

export const { toggleAutoPlay, setSpeechRate, setSelectedVoice } = speechSettingsSlice.actions

export default speechSettingsSlice.reducer
