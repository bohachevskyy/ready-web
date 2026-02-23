import { renderHook, act } from '@testing-library/react'
import { getHiddenCategories } from './useStoryCategories'
import { AgeGroup } from './useUserAge'
import { configureStore } from '@reduxjs/toolkit'
import categoriesReducer, { fetchCategories } from '../store/categoriesSlice'
import React from 'react'
import { Provider } from 'react-redux'

describe('getHiddenCategories', () => {
  it('should hide nothing for 10-14 age group', () => {
    expect(getHiddenCategories('10-14')).toEqual([])
  })

  it('should hide nothing for 15-17 age group', () => {
    expect(getHiddenCategories('15-17')).toEqual([])
  })

  it('should hide teen for 18+ age group', () => {
    expect(getHiddenCategories('18+')).toEqual(['teen'])
  })

  it('should not hide teen for minors', () => {
    const minorGroups: AgeGroup[] = ['10-14', '15-17']
    for (const ageGroup of minorGroups) {
      expect(getHiddenCategories(ageGroup)).not.toContain('teen')
    }
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
