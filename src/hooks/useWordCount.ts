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
  const hasCheckedCache = useRef(false)
  const hasFetchedRef = useRef(false) // Protection for undefined loop

  useEffect(() => {
    if (!isCountLoading) {
      // 1. Initial check on mount (respects cache)
      if (!hasCheckedCache.current) {
        hasCheckedCache.current = true
        dispatch(fetchWordsCount({ force: false }))
      } 
      // 2. Retry if undefined and haven't tried yet in this cycle
      else if (wordsCount === undefined && !hasFetchedRef.current) {
        hasFetchedRef.current = true
        dispatch(fetchWordsCount({ force: false }))
      }
    }

    // Reset loop protection when count becomes defined
    if (wordsCount !== undefined) {
      hasFetchedRef.current = false
    }
  }, [wordsCount, isCountLoading, dispatch])

  return {
    wordsCount: wordsCount ?? 0,  // Default to 0 for safe display
    isLoading: isCountLoading
  }
}
