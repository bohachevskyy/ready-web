/// <reference types="jest" />

import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { usePracticeKeyboard } from './usePracticeKeyboard'

// Test component that uses the hook
function TestComponent({
  showTranslation,
  onShowTranslation,
  onRate,
}: {
  showTranslation: boolean
  onShowTranslation: jest.Mock
  onRate: jest.Mock
}) {
  usePracticeKeyboard({
    showTranslation,
    onShowTranslation,
    onRate,
  })

  return (
    <div data-testid="test-component">
      <span data-testid="show-translation">{showTranslation ? 'shown' : 'hidden'}</span>
    </div>
  )
}

describe('usePracticeKeyboard', () => {
  let onShowTranslation: jest.Mock
  let onRate: jest.Mock

  beforeEach(() => {
    onShowTranslation = jest.fn()
    onRate = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when translation is hidden', () => {
    it('should call onShowTranslation when Space is pressed', () => {
      render(
        <TestComponent
          showTranslation={false}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { code: 'Space' })

      expect(onShowTranslation).toHaveBeenCalledTimes(1)
      expect(onRate).not.toHaveBeenCalled()
    })

    it('should not call onRate when 1-4 keys are pressed', () => {
      render(
        <TestComponent
          showTranslation={false}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { key: '1' })
      fireEvent.keyDown(document, { key: '2' })
      fireEvent.keyDown(document, { key: '3' })
      fireEvent.keyDown(document, { key: '4' })

      expect(onRate).not.toHaveBeenCalled()
    })
  })

  describe('when translation is shown', () => {
    it('should call onRate with "again" when 1 is pressed', () => {
      render(
        <TestComponent
          showTranslation={true}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { key: '1' })

      expect(onRate).toHaveBeenCalledWith('again')
      expect(onRate).toHaveBeenCalledTimes(1)
    })

    it('should call onRate with "hard" when 2 is pressed', () => {
      render(
        <TestComponent
          showTranslation={true}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { key: '2' })

      expect(onRate).toHaveBeenCalledWith('hard')
    })

    it('should call onRate with "good" when 3 is pressed', () => {
      render(
        <TestComponent
          showTranslation={true}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { key: '3' })

      expect(onRate).toHaveBeenCalledWith('good')
    })

    it('should call onRate with "easy" when 4 is pressed', () => {
      render(
        <TestComponent
          showTranslation={true}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { key: '4' })

      expect(onRate).toHaveBeenCalledWith('easy')
    })

    it('should not call onShowTranslation when Space is pressed', () => {
      render(
        <TestComponent
          showTranslation={true}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { code: 'Space' })

      expect(onShowTranslation).not.toHaveBeenCalled()
    })
  })

  describe('input field handling', () => {
    it('should not respond to keys when typing in an input field', () => {
      const TestWithInput = () => {
        usePracticeKeyboard({
          showTranslation: false,
          onShowTranslation,
          onRate,
        })
        return <input data-testid="test-input" type="text" />
      }

      render(<TestWithInput />)

      const input = screen.getByTestId('test-input')
      fireEvent.keyDown(input, { code: 'Space' })

      expect(onShowTranslation).not.toHaveBeenCalled()
    })

    it('should not respond to keys when typing in a textarea', () => {
      const TestWithTextarea = () => {
        usePracticeKeyboard({
          showTranslation: true,
          onShowTranslation,
          onRate,
        })
        return <textarea data-testid="test-textarea" />
      }

      render(<TestWithTextarea />)

      const textarea = screen.getByTestId('test-textarea')
      fireEvent.keyDown(textarea, { key: '1' })

      expect(onRate).not.toHaveBeenCalled()
    })
  })

  describe('invalid keys', () => {
    it('should not respond to invalid keys', () => {
      render(
        <TestComponent
          showTranslation={true}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      fireEvent.keyDown(document, { key: '5' })
      fireEvent.keyDown(document, { key: 'a' })
      fireEvent.keyDown(document, { key: 'Enter' })

      expect(onRate).not.toHaveBeenCalled()
      expect(onShowTranslation).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { unmount } = render(
        <TestComponent
          showTranslation={false}
          onShowTranslation={onShowTranslation}
          onRate={onRate}
        />
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      removeEventListenerSpy.mockRestore()
    })
  })
})
