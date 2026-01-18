import { useMemo } from 'react'
import { useUserAge, AgeGroup } from './useUserAge'

export type CategoryType = 'teens' | 'nonfiction' | 'fiction'

export function getVisibleCategories(ageGroup: AgeGroup): CategoryType[] {
  switch (ageGroup) {
    case 'under15':
      return ['teens', 'nonfiction']
    case '15-17':
      return ['teens', 'nonfiction']
    case 'adult':
      return ['nonfiction', 'fiction']
  }
}

export function useStoryCategories() {
  const { ageGroup } = useUserAge()

  const visibleCategories = useMemo(() => {
    return getVisibleCategories(ageGroup)
  }, [ageGroup])

  return { visibleCategories }
}
