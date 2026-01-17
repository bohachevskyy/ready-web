import { useMemo } from 'react'
import { useAppSelector } from '../store/store'

export type AgeGroup = 'under15' | '15-17' | 'adult'

export function getAgeGroup(age: number | null): AgeGroup {
  if (age === null || age >= 18) return 'adult'
  if (age < 15) return 'under15'
  return '15-17'
}

/**
 * Custom hook to calculate user's age from birth date
 *
 * @returns Object containing:
 *   - age: number | null - The calculated age, or null if birth date is not available
 *   - ageGroup: AgeGroup - 'under15', '15-17', or 'adult'
 */
export function useUserAge() {
  const userProfile = useAppSelector((state) => state.user.profile)

  const { age, ageGroup } = useMemo(() => {
    if (!userProfile?.birth_year || !userProfile?.birth_month) {
      return { age: null, ageGroup: 'adult' as AgeGroup }
    }

    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1 // getMonth() returns 0-11

    let calculatedAge = currentYear - userProfile.birth_year

    // Adjust age if birthday hasn't occurred this year yet
    if (currentMonth < userProfile.birth_month || (currentMonth === userProfile.birth_month && today.getDate() < 1)) {
      calculatedAge--
    }

    return {
      age: calculatedAge,
      ageGroup: getAgeGroup(calculatedAge)
    }
  }, [userProfile?.birth_year, userProfile?.birth_month])

  return { age, ageGroup }
}
