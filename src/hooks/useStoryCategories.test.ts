import { getVisibleCategories, CategoryType } from './useStoryCategories'
import { AgeGroup } from './useUserAge'

describe('getVisibleCategories', () => {
  describe('under15 age group', () => {
    it('should return teens and nonfiction categories (no fiction)', () => {
      const result = getVisibleCategories('under15')

      expect(result).toEqual(['teens', 'nonfiction'])
    })

    it('should have teens as first category', () => {
      const result = getVisibleCategories('under15')

      expect(result[0]).toBe('teens')
    })

    it('should not include fiction for under15', () => {
      const result = getVisibleCategories('under15')

      expect(result).not.toContain('fiction')
    })
  })

  describe('15-17 age group', () => {
    it('should return all categories: nonfiction, fiction, teens', () => {
      const result = getVisibleCategories('15-17')

      expect(result).toEqual(['nonfiction', 'fiction', 'teens'])
    })

    it('should have nonfiction as first category', () => {
      const result = getVisibleCategories('15-17')

      expect(result[0]).toBe('nonfiction')
    })

    it('should include all three categories', () => {
      const result = getVisibleCategories('15-17')

      expect(result).toHaveLength(3)
      expect(result).toContain('nonfiction')
      expect(result).toContain('fiction')
      expect(result).toContain('teens')
    })
  })

  describe('adult age group', () => {
    it('should return nonfiction and fiction categories (no teens)', () => {
      const result = getVisibleCategories('adult')

      expect(result).toEqual(['nonfiction', 'fiction'])
    })

    it('should have nonfiction as first category', () => {
      const result = getVisibleCategories('adult')

      expect(result[0]).toBe('nonfiction')
    })

    it('should not include teens for adults', () => {
      const result = getVisibleCategories('adult')

      expect(result).not.toContain('teens')
    })
  })

  describe('category ordering', () => {
    const testCases: Array<{ ageGroup: AgeGroup; expectedOrder: CategoryType[] }> = [
      { ageGroup: 'under15', expectedOrder: ['teens', 'nonfiction'] },
      { ageGroup: '15-17', expectedOrder: ['nonfiction', 'fiction', 'teens'] },
      { ageGroup: 'adult', expectedOrder: ['nonfiction', 'fiction'] },
    ]

    testCases.forEach(({ ageGroup, expectedOrder }) => {
      it(`should return correct order for ${ageGroup}`, () => {
        expect(getVisibleCategories(ageGroup)).toEqual(expectedOrder)
      })
    })
  })
})
