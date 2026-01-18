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
  const user = useAppSelector((state) => state.auth.user)

  const { age, ageGroup } = useMemo(() => {
    if (!user?.birth_year || !user?.birth_month) {
      return { age: null, ageGroup: 'adult' as AgeGroup }
    }

    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1 // getMonth() returns 0-11

    let calculatedAge = currentYear - user.birth_year

    // Adjust age if birthday hasn't occurred this year yet
    if (currentMonth < user.birth_month || (currentMonth === user.birth_month && today.getDate() < 1)) {
      calculatedAge--
    }

    return {
      age: calculatedAge,
      ageGroup: getAgeGroup(calculatedAge)
    }
  }, [user?.birth_year, user?.birth_month])

  return { age, ageGroup }
}
