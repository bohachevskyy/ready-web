import type { WordDetailsResponse } from "../../store/storiesSlice"

export interface PopoverPosition {
  x: number
  y: number
  showBelow: boolean
  horizontalAlign: 'left' | 'center' | 'right'
}

export interface WordClickHandler {
  (event: React.MouseEvent): Promise<void>
}

export interface WordPopoverProps {
  popoverPosition: PopoverPosition | null
  selectedWord: WordDetailsResponse | null
  savedWords: Array<{ word: string }>
  onClose: () => void
  onAddWord: () => void
}

export interface WordDrawerProps {
  isOpen: boolean
  selectedWord: WordDetailsResponse | null
  savedWords: Array<{ word: string }>
  onClose: () => void
  onAddWord: () => void
}

export interface VocabDrawerProps {
  savedWords: Array<{ id: string; word: string; translation: string }>
  onRemoveWord: (id: string) => void
}

export interface StoryContentProps {
  storyText: string
  storyError: string | null
  onWordClick: WordClickHandler
}
