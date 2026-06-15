import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import counterReducer from './counterSlice'
import vocabularyReducer from './vocabularySlice'
import storyReducer from './storySlice'
import authReducer from './authSlice'
import wordsReducer from './wordsSlice'
import speechSettingsReducer from './speechSettingsSlice'
import userReducer from './userSlice'
import storiesReducer from './storiesSlice'
import categoriesReducer from './categoriesSlice'
import dashboardReducer from './dashboardSlice'
import { authMiddleware } from './authMiddleware'
import { sentryMiddleware } from './sentryMiddleware'

// Configure persistence for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'tokenExpiresAt', 'refreshToken', 'refreshTokenExpiresAt', 'user', 'uiLanguage'], // Only persist these fields
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

// Configure persistence for speech settings slice
const speechSettingsPersistConfig = {
  key: 'speechSettings',
  storage,
  whitelist: ['autoPlayEnabled', 'speechRate', 'selectedVoice'], // Persist all speech settings
}

const persistedSpeechSettingsReducer = persistReducer(speechSettingsPersistConfig, speechSettingsReducer)

// Configure persistence for dashboard cache
const dashboardPersistConfig = {
  key: 'dashboard',
  storage,
  whitelist: ['dataByView', 'lastFetchedByView'],
}

const persistedDashboardReducer = persistReducer(dashboardPersistConfig, dashboardReducer)

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    vocabulary: vocabularyReducer,
    story: storyReducer,
    auth: persistedAuthReducer,
    words: wordsReducer,
    speechSettings: persistedSpeechSettingsReducer,
    user: userReducer,
    stories: storiesReducer,
    categories: categoriesReducer,
    dashboard: persistedDashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authMiddleware, sentryMiddleware),
})

export const persistor = persistStore(store)

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
