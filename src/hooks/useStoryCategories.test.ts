import { getVisibleCategories, CategoryType } from './useStoryCategories'
import { AgeGroup } from './useUserAge'

describe('getVisibleCategories', () => {
  describe('10-14 age group', () => {
    it('should return teens and nonfiction categories (no fiction)', () => {
      const result = getVisibleCategories('10-14')

      expect(result).toEqual(['teens', 'nonfiction'])
    })

    it('should have teens as first category', () => {
      const result = getVisibleCategories('10-14')

      expect(result[0]).toBe('teens')
    })

    it('should not include fiction for 10-14', () => {
      const result = getVisibleCategories('10-14')

      expect(result).not.toContain('fiction')
    })
  })

  describe('15-17 age group', () => {
    it('should return teens, nonfiction, and fiction categories', () => {
      const result = getVisibleCategories('15-17')

      expect(result).toEqual(['teens', 'nonfiction', 'fiction'])
    })

    it('should have teens as first category', () => {
      const result = getVisibleCategories('15-17')

      expect(result[0]).toBe('teens')
    })

    it('should include fiction for 15-17', () => {
      const result = getVisibleCategories('15-17')

      expect(result).toContain('fiction')
    })
  })

  describe('18+ age group', () => {
    it('should return nonfiction and fiction categories (no teens)', () => {
      const result = getVisibleCategories('18+')

      expect(result).toEqual(['nonfiction', 'fiction'])
    })

    it('should have nonfiction as first category', () => {
      const result = getVisibleCategories('18+')

      expect(result[0]).toBe('nonfiction')
    })

    it('should not include teens for 18+', () => {
      const result = getVisibleCategories('18+')

      expect(result).not.toContain('teens')
    })
  })

  describe('category ordering', () => {
    const testCases: Array<{ ageGroup: AgeGroup; expectedOrder: CategoryType[] }> = [
      { ageGroup: '10-14', expectedOrder: ['teens', 'nonfiction'] },
      { ageGroup: '15-17', expectedOrder: ['teens', 'nonfiction', 'fiction'] },
      { ageGroup: '18+', expectedOrder: ['nonfiction', 'fiction'] },
    ]

    testCases.forEach(({ ageGroup, expectedOrder }) => {
      it(`should return correct order for ${ageGroup}`, () => {
        expect(getVisibleCategories(ageGroup)).toEqual(expectedOrder)
      })
    })
  })
})
