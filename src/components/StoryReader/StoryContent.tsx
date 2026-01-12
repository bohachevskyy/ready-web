import type React from "react"
import { Button } from "../ui/button"

interface StoryContentProps {
  storyText: string
  storyError: string | null
  onWordClick: (event: React.MouseEvent) => void
}

export function StoryContent({ storyText, storyError, onWordClick }: StoryContentProps) {
  if (storyError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-destructive mb-4">Failed to generate story</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  const lines = storyText.split('\n')
  let currentPosition = 0

  return (
    <div className="text-lg leading-relaxed text-card-foreground">
      {lines.map((line, lineIndex) => {
        const tokens = line.split(/(\s+|[.,!?;:"""''()[\]{}]+)/)

        const lineContent = (
          <p key={lineIndex}>
            {tokens.map((token, tokenIndex) => {
              // Skip empty tokens
              if (!token) return null

              const startPos = currentPosition
              const endPos = currentPosition + token.length
              currentPosition = endPos

              // Render whitespace as-is
              if (token.match(/^\s+$/)) {
                return <span key={tokenIndex}>{token}</span>
              }

              // Render punctuation as plain text
              if (token.match(/^[.,!?;:"""''()[\]{}]+$/)) {
                return <span key={tokenIndex}>{token}</span>
              }

              // All words are clickable - translations fetched on demand
              return (
                <span
                  key={tokenIndex}
                  onClick={onWordClick}
                  data-start={startPos}
                  data-end={endPos}
                  className="cursor-pointer hover:bg-primary/15 hover:text-primary rounded px-0.5 transition-colors"
                >
                  {token}
                </span>
              )
            })}
          </p>
        )

        // Add newline character to position counter (except for last line)
        if (lineIndex < lines.length - 1) {
          currentPosition += 1
        }

        return lineContent
      })}
    </div>
  )
}
