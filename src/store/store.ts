import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import counterReducer from './counterSlice'
import vocabularyReducer from './vocabularySlice'
import storyReducer from './storySlice'
import authReducer from './authSlice'
import wordsReducer from './wordsSlice'
import speechSettingsReducer from './speechSettingsSlice'
import { translationApi } from '../services/translationApi'
import { storiesApi } from '../services/storiesApi'
import { userApi } from '../services/userApi'
import { authMiddleware } from './authMiddleware'

// Configure persistence for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'tokenExpiresAt', 'refreshToken', 'refreshTokenExpiresAt', 'user'], // Only persist these fields
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

// Configure persistence for speech settings slice
const speechSettingsPersistConfig = {
  key: 'speechSettings',
  storage,
  whitelist: ['autoPlayEnabled', 'speechRate', 'selectedVoice'], // Persist all speech settings
}

const persistedSpeechSettingsReducer = persistReducer(speechSettingsPersistConfig, speechSettingsReducer)

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    vocabulary: vocabularyReducer,
    story: storyReducer,
    auth: persistedAuthReducer,
    words: wordsReducer,
    speechSettings: persistedSpeechSettingsReducer,
    // Add the RTK Query API reducers
    [translationApi.reducerPath]: translationApi.reducer,
    [storiesApi.reducerPath]: storiesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  // Add the RTK Query middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      translationApi.middleware,
      storiesApi.middleware,
      userApi.middleware,
      authMiddleware
    ),
})

export const persistor = persistStore(store)

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch)

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
