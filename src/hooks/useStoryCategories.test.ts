import { renderHook, act } from '@testing-library/react'
import { getVisibleCategories, CategoryType } from './useStoryCategories'
import { AgeGroup } from './useUserAge'
import { configureStore } from '@reduxjs/toolkit'
import categoriesReducer, { fetchCategories } from '../store/categoriesSlice'
import React from 'react'
import { Provider } from 'react-redux'

describe('getVisibleCategories', () => {
  describe('10-14 age group', () => {
    it('should return teens and nonfiction categories (no fiction)', () => {
      const result = getVisibleCategories('10-14')

      expect(result).toEqual(['teen', 'nonfiction'])
    })

    it('should have teens as first category', () => {
      const result = getVisibleCategories('10-14')

      expect(result[0]).toBe('teen')
    })

    it('should not include fiction for 10-14', () => {
      const result = getVisibleCategories('10-14')

      expect(result).not.toContain('fiction')
    })

    it('should not include professional for 10-14', () => {
      const result = getVisibleCategories('10-14')

      expect(result).not.toContain('professional')
    })
  })

  describe('15-17 age group', () => {
    it('should return teens, nonfiction, professional, and fiction categories', () => {
      const result = getVisibleCategories('15-17')

      expect(result).toEqual(['teen', 'nonfiction', 'professional', 'fiction'])
    })

    it('should have teens as first category', () => {
      const result = getVisibleCategories('15-17')

      expect(result[0]).toBe('teen')
    })

    it('should include fiction for 15-17', () => {
      const result = getVisibleCategories('15-17')

      expect(result).toContain('fiction')
    })

    it('should include professional for 15-17', () => {
      const result = getVisibleCategories('15-17')

      expect(result).toContain('professional')
    })
  })

  describe('18+ age group', () => {
    it('should return nonfiction, professional, and fiction categories (no teens)', () => {
      const result = getVisibleCategories('18+')

      expect(result).toEqual(['nonfiction', 'professional', 'fiction'])
    })

    it('should have nonfiction as first category', () => {
      const result = getVisibleCategories('18+')

      expect(result[0]).toBe('nonfiction')
    })

    it('should not include teens for 18+', () => {
      const result = getVisibleCategories('18+')

      expect(result).not.toContain('teen')
    })

    it('should include professional for 18+', () => {
      const result = getVisibleCategories('18+')

      expect(result).toContain('professional')
    })
  })

  describe('category ordering', () => {
    const testCases: Array<{ ageGroup: AgeGroup; expectedOrder: CategoryType[] }> = [
      { ageGroup: '10-14', expectedOrder: ['teen', 'nonfiction'] },
      { ageGroup: '15-17', expectedOrder: ['teen', 'nonfiction', 'professional', 'fiction'] },
      { ageGroup: '18+', expectedOrder: ['nonfiction', 'professional', 'fiction'] },
    ]

    testCases.forEach(({ ageGroup, expectedOrder }) => {
      it(`should return correct order for ${ageGroup}`, () => {
        expect(getVisibleCategories(ageGroup)).toEqual(expectedOrder)
      })
    })
  })
})

describe('useStoryCategories hook', () => {
  it('should not re-dispatch fetchCategories after a fetch error (no infinite loop)', async () => {
    // Create a store where categories has an error state
    const store = configureStore({
      reducer: {
        categories: categoriesReducer,
        auth: (state = { user: null }) => state,
      },
    })

    // Simulate a failed fetch by dispatching directly
    const dispatchSpy = jest.spyOn(store, 'dispatch')

    // Set up the error state: categories empty, not loading, has error
    // We do this by importing and using the actual hook with a wrapper
    const { useStoryCategories } = require('./useStoryCategories')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store, children } as any)

    // Mock fetchWithAuth to fail
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

    const { result, rerender } = renderHook(() => useStoryCategories(), { wrapper })

    // Wait for the initial dispatch
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // Count how many times fetchCategories was dispatched
    const fetchDispatches = dispatchSpy.mock.calls.filter(
      (call) => typeof call[0] === 'function' || (call[0] && (call[0] as any).type?.includes?.('fetchCategories'))
    )

    // Clear and re-render to see if it dispatches again
    dispatchSpy.mockClear()

    rerender()
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    const secondFetchDispatches = dispatchSpy.mock.calls.filter(
      (call) => typeof call[0] === 'function'
    )

    // After error, it should NOT dispatch again (the bug was infinite re-dispatching)
    expect(secondFetchDispatches.length).toBe(0)

    jest.restoreAllMocks()
  })
})
