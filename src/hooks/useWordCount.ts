import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/store'
import { fetchWordsCount } from '../store/wordsSlice'

// Shared module-level promise to prevent duplicate requests across all hook instances
let pendingFetch: Promise<any> | null = null

// Export reset function for testing
export function resetPendingFetch() {
  pendingFetch = null
}

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

  // Clear pending fetch when loading completes
  useEffect(() => {
    if (!isCountLoading) {
      pendingFetch = null
    }
  }, [isCountLoading])

  useEffect(() => {
    // Skip if already loading or if count is already defined
    if (isCountLoading || wordsCount !== undefined || pendingFetch !== null) {
      return
    }

    // 1. Initial check on mount (respects cache)
    if (!hasCheckedCache.current) {
      hasCheckedCache.current = true
      const promise = dispatch(fetchWordsCount({ force: false }))
      pendingFetch = promise
      promise.finally(() => {
        if (pendingFetch === promise) {
          pendingFetch = null
        }
      })
    } 
    // 2. Retry if undefined and haven't tried yet in this cycle
    else if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      const promise = dispatch(fetchWordsCount({ force: false }))
      pendingFetch = promise
      promise.finally(() => {
        if (pendingFetch === promise) {
          pendingFetch = null
        }
      })
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
