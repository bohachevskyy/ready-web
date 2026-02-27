import { useEffect, useMemo } from 'react'
import { useUserAge, AgeGroup } from './useUserAge'
import { useAppDispatch, useAppSelector } from '../store/store'
import { fetchCategories, Category, Domain } from '../store/categoriesSlice'
import { useFavoriteDomains } from './useFavoriteDomains'

export type { Category, Domain }

export function getHiddenCategories(ageGroup: AgeGroup): string[] {
  switch (ageGroup) {
    case '10-14':
      return []
    case '15-17':
      return []
    case '18+':
      return ['teen']
  }
}

export function useStoryCategories() {
  const dispatch = useAppDispatch()
  const { ageGroup } = useUserAge()
  const { categories, favoriteDomains, isLoading, error } = useAppSelector((state) => state.categories)
  const { userFavoriteDomains, userFavoriteDomainIds } = useFavoriteDomains()

  useEffect(() => {
    if (categories.length === 0 && !isLoading && !error) {
      dispatch(fetchCategories())
    }
  }, [categories.length, dispatch, isLoading, error])

  const filteredCategories = useMemo(() => {
    const hidden = getHiddenCategories(ageGroup)
    return categories
      .filter((category) => !hidden.includes(category.name))
      .sort((a, b) => a.order - b.order)
  }, [categories, ageGroup])

  return {
    filteredCategories,
    categories,
    favoriteDomains,
    userFavoriteDomains,
    userFavoriteDomainIds,
    isLoading,
    error,
  }
}
