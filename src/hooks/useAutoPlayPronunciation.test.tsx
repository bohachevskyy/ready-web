/// <reference types="jest" />

import React, { useState } from 'react'
import { render, act } from '@testing-library/react'
import { useAutoPlayPronunciation } from './useAutoPlayPronunciation'

// Mock card type for testing
interface MockCard {
  word: string
}

// Test component that uses the hook
function TestComponent({
  autoPlayEnabled,
  supported,
  cards,
  currentIndex,
  speechRate,
  sessionComplete,
  speak,
}: {
  autoPlayEnabled: boolean
  supported: boolean
  cards: MockCard[]
  currentIndex: number
  speechRate: number
  sessionComplete: boolean
  speak: jest.Mock
}) {
  useAutoPlayPronunciation({
    autoPlayEnabled,
    supported,
    cards,
    currentIndex,
    speechRate,
    sessionComplete,
    speak,
  })

  return <div data-testid="test-component" />
}

describe('useAutoPlayPronunciation', () => {
  let speak: jest.Mock

  beforeEach(() => {
    speak = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  const defaultCards: MockCard[] = [
    { word: 'hello' },
    { word: 'world' },
    { word: 'test' },
  ]

  it('should call speak when all conditions are met', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={defaultCards}
        currentIndex={0}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).toHaveBeenCalledTimes(1)
    expect(speak).toHaveBeenCalledWith('hello', { rate: 1.0 })
  })

  it('should NOT call speak when sessionComplete is true', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={defaultCards}
        currentIndex={0}
        speechRate={1.0}
        sessionComplete={true}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).not.toHaveBeenCalled()
  })

  it('should NOT call speak when autoPlayEnabled is false', () => {
    render(
      <TestComponent
        autoPlayEnabled={false}
        supported={true}
        cards={defaultCards}
        currentIndex={0}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).not.toHaveBeenCalled()
  })

  it('should NOT call speak when supported is false', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={false}
        cards={defaultCards}
        currentIndex={0}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).not.toHaveBeenCalled()
  })

  it('should NOT call speak when cards array is empty', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={[]}
        currentIndex={0}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).not.toHaveBeenCalled()
  })

  it('should NOT call speak when currentIndex is out of bounds', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={defaultCards}
        currentIndex={10}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).not.toHaveBeenCalled()
  })

  it('should use the correct speech rate', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={defaultCards}
        currentIndex={0}
        speechRate={1.5}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).toHaveBeenCalledWith('hello', { rate: 1.5 })
  })

  it('should speak the correct word based on currentIndex', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={defaultCards}
        currentIndex={1}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).toHaveBeenCalledWith('world', { rate: 1.0 })
  })

  it('should clear timeout on unmount', () => {
    const { unmount } = render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={defaultCards}
        currentIndex={0}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    // Unmount before timer fires
    unmount()

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(speak).not.toHaveBeenCalled()
  })

  it('should NOT speak before 300ms delay', () => {
    render(
      <TestComponent
        autoPlayEnabled={true}
        supported={true}
        cards={defaultCards}
        currentIndex={0}
        speechRate={1.0}
        sessionComplete={false}
        speak={speak}
      />
    )

    act(() => {
      jest.advanceTimersByTime(299)
    })

    expect(speak).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(speak).toHaveBeenCalledTimes(1)
  })

  describe('when currentIndex changes to 0 while sessionComplete is true', () => {
    it('should NOT speak (regression test for the bug)', () => {
      // This simulates the exact bug scenario:
      // Session completes, clearWords() resets currentIndex to 0,
      // but cards still exist. Should NOT pronounce.
      const TestWithDynamicState = () => {
        const [sessionComplete, setSessionComplete] = useState(false)
        const [currentIndex, setCurrentIndex] = useState(2)

        // Simulate what happens when session completes
        React.useEffect(() => {
          if (!sessionComplete) {
            // After first render, simulate session completion
            const timer = setTimeout(() => {
              setSessionComplete(true)
              setCurrentIndex(0) // clearWords() resets this
            }, 100)
            return () => clearTimeout(timer)
          }
        }, [sessionComplete])

        useAutoPlayPronunciation({
          autoPlayEnabled: true,
          supported: true,
          cards: defaultCards,
          currentIndex,
          speechRate: 1.0,
          sessionComplete,
          speak,
        })

        return <div />
      }

      render(<TestWithDynamicState />)

      // Initial render: currentIndex=2, sessionComplete=false
      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Should speak 'test' (cards[2])
      expect(speak).toHaveBeenCalledTimes(1)
      expect(speak).toHaveBeenCalledWith('test', { rate: 1.0 })

      speak.mockClear()

      // Simulate state change: sessionComplete=true, currentIndex=0
      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Now currentIndex changed to 0 and sessionComplete is true
      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Should NOT speak because sessionComplete is true
      expect(speak).not.toHaveBeenCalled()
    })
  })
})
