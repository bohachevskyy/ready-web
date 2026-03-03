import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { PageTitleProvider, usePageTitle } from '../contexts/PageTitleContext'

describe('usePageTitle', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(PageTitleProvider, null, children)

  it('should initialize with empty title', () => {
    const { result } = renderHook(() => usePageTitle(), { wrapper })
    expect(result.current.pageTitle).toBe('')
  })

  it('should update page title and document.title', () => {
    const { result } = renderHook(() => usePageTitle(), { wrapper })

    act(() => {
      result.current.setPageTitle('My Story')
    })

    expect(result.current.pageTitle).toBe('My Story')
    expect(document.title).toBe('My Story — Readerly')
  })

  it('should reset document.title when cleared', () => {
    const { result } = renderHook(() => usePageTitle(), { wrapper })

    act(() => {
      result.current.setPageTitle('Test')
    })
    expect(document.title).toBe('Test — Readerly')

    act(() => {
      result.current.setPageTitle('')
    })
    expect(document.title).toBe('Readerly')
  })
})
