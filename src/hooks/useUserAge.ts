import { useMemo } from 'react'
import { useAppSelector } from '../store/store'

/**
 * Custom hook to calculate user's age from birth date
 *
 * @returns Object containing:
 *   - age: number | null - The calculated age, or null if birth date is not available
 *   - isBelow16: boolean - Whether the user is below 16 years old
 */
export function useUserAge() {
  const userProfile = useAppSelector((state) => state.user.profile)

  const { age, isBelow16 } = useMemo(() => {
    if (!userProfile?.birth_year || !userProfile?.birth_month) {
      return { age: null, isBelow16: false }
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
      isBelow16: calculatedAge < 16
    }
  }, [userProfile?.birth_year, userProfile?.birth_month])

  return { age, isBelow16 }
}
