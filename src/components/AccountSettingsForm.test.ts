import { AgeGroup } from '../hooks/useUserAge'
import { getAgeGroupDisplay } from './AccountSettingsForm'

describe('getAgeGroupDisplay', () => {
  describe('age group display mapping', () => {
    it('should return "10-14" for under15 age group', () => {
      expect(getAgeGroupDisplay('under15')).toBe('10-14')
    })

    it('should return "15-17" for 15-17 age group', () => {
      expect(getAgeGroupDisplay('15-17')).toBe('15-17')
    })

    it('should return "18+" for adult age group', () => {
      expect(getAgeGroupDisplay('adult')).toBe('18+')
    })
  })

  describe('all age groups', () => {
    const testCases: Array<{ ageGroup: AgeGroup; expected: string }> = [
      { ageGroup: 'under15', expected: '10-14' },
      { ageGroup: '15-17', expected: '15-17' },
      { ageGroup: 'adult', expected: '18+' },
    ]

    testCases.forEach(({ ageGroup, expected }) => {
      it(`should return "${expected}" for ${ageGroup}`, () => {
        expect(getAgeGroupDisplay(ageGroup)).toBe(expected)
      })
    })
  })
})
