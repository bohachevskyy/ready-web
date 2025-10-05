import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import counterReducer from './counterSlice'
import vocabularyReducer from './vocabularySlice'
import storyReducer from './storySlice'
import { translationApi } from '../services/translationApi'
import { storiesApi } from '../services/storiesApi'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    vocabulary: vocabularyReducer,
    story: storyReducer,
    // Add the RTK Query API reducers
    [translationApi.reducerPath]: translationApi.reducer,
    [storiesApi.reducerPath]: storiesApi.reducer,
  },
  // Add the RTK Query middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(translationApi.middleware, storiesApi.middleware),
})

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch)

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
