import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import counterReducer from './counterSlice'
import vocabularyReducer from './vocabularySlice'
import storyReducer from './storySlice'
import authReducer from './authSlice'
import { translationApi } from '../services/translationApi'
import { storiesApi } from '../services/storiesApi'
import { wordsApi } from '../services/wordsApi'
import { authMiddleware } from './authMiddleware'

// Configure persistence for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'refreshToken', 'user'], // Only persist these fields
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    vocabulary: vocabularyReducer,
    story: storyReducer,
    auth: persistedAuthReducer,
    // Add the RTK Query API reducers
    [translationApi.reducerPath]: translationApi.reducer,
    [storiesApi.reducerPath]: storiesApi.reducer,
    [wordsApi.reducerPath]: wordsApi.reducer,
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
      wordsApi.middleware,
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
