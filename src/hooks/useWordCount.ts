import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/store'
import { fetchWordsCount } from '../store/wordsSlice'

/**
 * Custom hook to auto-fetch word count when undefined
 *
 * Automatically triggers API call when wordsCount is undefined.
 * This ensures the count is always fresh and accurate.
 *
 * @returns Object containing wordsCount (defaults to 0) and isLoading state
 */
export function useWordCount() {
  const dispatch = useAppDispatch()
  const { wordsCount, isCountLoading } = useAppSelector(state => state.words)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Auto-fetch if count is undefined and not already loading
    // Use ref to prevent duplicate dispatches in StrictMode
    if (wordsCount === undefined && !isCountLoading && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchWordsCount({ force: true }))
    }

    // Reset ref when count becomes defined (successful fetch)
    if (wordsCount !== undefined) {
      hasFetchedRef.current = false
    }
  }, [wordsCount, isCountLoading, dispatch])

  return {
    wordsCount: wordsCount ?? 0,  // Default to 0 for safe display
    isLoading: isCountLoading
  }
}
