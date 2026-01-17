import { getAgeGroup, AgeGroup } from './useUserAge'

describe('getAgeGroup', () => {
  describe('under15 age group', () => {
    it('should return under15 for age 10', () => {
      expect(getAgeGroup(10)).toBe('under15')
    })

    it('should return under15 for age 14', () => {
      expect(getAgeGroup(14)).toBe('under15')
    })

    it('should return under15 for age 0', () => {
      expect(getAgeGroup(0)).toBe('under15')
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

  describe('adult age group', () => {
    it('should return adult for age 18', () => {
      expect(getAgeGroup(18)).toBe('adult')
    })

    it('should return adult for age 25', () => {
      expect(getAgeGroup(25)).toBe('adult')
    })

    it('should return adult for age 65', () => {
      expect(getAgeGroup(65)).toBe('adult')
    })
  })

  describe('null age (missing birth data)', () => {
    it('should return adult for null age', () => {
      expect(getAgeGroup(null)).toBe('adult')
    })
  })

  describe('boundary cases', () => {
    const testCases: Array<{ age: number | null; expected: AgeGroup }> = [
      { age: 14, expected: 'under15' },
      { age: 15, expected: '15-17' },
      { age: 17, expected: '15-17' },
      { age: 18, expected: 'adult' },
    ]

    testCases.forEach(({ age, expected }) => {
      it(`should return ${expected} for age ${age}`, () => {
        expect(getAgeGroup(age)).toBe(expected)
      })
    })
  })
})
