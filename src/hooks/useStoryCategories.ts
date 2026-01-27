import { useMemo } from 'react'
import { useUserAge, AgeGroup } from './useUserAge'

export type CategoryType = 'teens' | 'nonfiction' | 'fiction' | 'professional'

export function getVisibleCategories(ageGroup: AgeGroup): CategoryType[] {
  switch (ageGroup) {
    case '10-14':
      return ['teens', 'nonfiction']
    case '15-17':
      return ['teens', 'nonfiction', 'professional', 'fiction']
    case '18+':
      return ['nonfiction', 'professional', 'fiction']
  }
}

export function useStoryCategories() {
  const { ageGroup } = useUserAge()

  const visibleCategories = useMemo(() => {
    return getVisibleCategories(ageGroup)
  }, [ageGroup])

  return { visibleCategories }
}
