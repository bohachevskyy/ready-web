import { getAgeGroup, AgeGroup } from './useUserAge'

describe('getAgeGroup', () => {
  describe('10-14 age group', () => {
    it('should return 10-14 for age 10', () => {
      expect(getAgeGroup(10)).toBe('10-14')
    })

    it('should return 10-14 for age 14', () => {
      expect(getAgeGroup(14)).toBe('10-14')
    })

    it('should return 10-14 for age 0', () => {
      expect(getAgeGroup(0)).toBe('10-14')
    })
  })

  describe('15-17 age group', () => {
    it('should return 15-17 for age 15', () => {
      expect(getAgeGroup(15)).toBe('15-17')
    })

    it('should return 15-17 for age 16', () => {
      expect(getAgeGroup(16)).toBe('15-17')
    })

    it('should return 15-17 for age 17', () => {
      expect(getAgeGroup(17)).toBe('15-17')
    })
  })

  describe('18+ age group', () => {
    it('should return 18+ for age 18', () => {
      expect(getAgeGroup(18)).toBe('18+')
    })

    it('should return 18+ for age 25', () => {
      expect(getAgeGroup(25)).toBe('18+')
    })

    it('should return 18+ for age 65', () => {
      expect(getAgeGroup(65)).toBe('18+')
    })
  })

  describe('null age (missing birth data)', () => {
    it('should return 18+ for null age', () => {
      expect(getAgeGroup(null)).toBe('18+')
    })
  })

  describe('boundary cases', () => {
    const testCases: Array<{ age: number | null; expected: AgeGroup }> = [
      { age: 14, expected: '10-14' },
      { age: 15, expected: '15-17' },
      { age: 17, expected: '15-17' },
      { age: 18, expected: '18+' },
    ]

    testCases.forEach(({ age, expected }) => {
      it(`should return ${expected} for age ${age}`, () => {
        expect(getAgeGroup(age)).toBe(expected)
      })
    })
  })
})
