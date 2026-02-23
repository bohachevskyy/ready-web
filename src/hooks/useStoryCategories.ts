import { useEffect, useMemo } from 'react'
import { useUserAge, AgeGroup } from './useUserAge'
import { useAppDispatch, useAppSelector } from '../store/store'
import { fetchCategories, Category, Domain } from '../store/categoriesSlice'

export type CategoryType = 'teen' | 'nonfiction' | 'fiction' | 'professional'
export type { Category, Domain }

export function getVisibleCategories(ageGroup: AgeGroup): CategoryType[] {
  switch (ageGroup) {
    case '10-14':
      return ['teen', 'nonfiction']
    case '15-17':
      return ['teen', 'nonfiction', 'professional', 'fiction']
    case '18+':
      return ['nonfiction', 'professional', 'fiction']
  }
}

export function useStoryCategories() {
  const dispatch = useAppDispatch()
  const { ageGroup } = useUserAge()
  const { categories, isLoading, error } = useAppSelector((state) => state.categories)

  useEffect(() => {
    if (categories.length === 0 && !isLoading && !error) {
      dispatch(fetchCategories())
    }
  }, [categories.length, dispatch, isLoading, error])

  const visibleCategories = useMemo(() => {
    return getVisibleCategories(ageGroup)
  }, [ageGroup])

  return { visibleCategories, categories, isLoading, error }
}
