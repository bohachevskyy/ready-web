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

  // Filter out empty lines for rendering but keep position tracking
  const nonEmptyLines: { line: string; originalIndex: number }[] = []
  lines.forEach((line, idx) => {
    if (line.trim()) {
      nonEmptyLines.push({ line, originalIndex: idx })
    }
  })

  return (
    <div className="font-serif text-xl leading-[1.85] text-foreground/90 space-y-6">
      {lines.map((line, lineIndex) => {
        const tokens = line.split(/(\s+|[.,!?;:"""''()[\]{}]+)/)

        // Determine if this is the first non-empty paragraph for drop cap
        const isFirstParagraph = line.trim() && nonEmptyLines.length > 0 && nonEmptyLines[0].originalIndex === lineIndex

        const lineContent = (
          <p key={lineIndex} className={line.trim() ? '' : 'hidden'}>
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

              // Drop cap for the very first word of the first paragraph
              if (isFirstParagraph && tokenIndex === 0) {
                const firstChar = token.charAt(0)
                const rest = token.slice(1)
                return (
                  <span
                    key={tokenIndex}
                    onClick={onWordClick}
                    data-start={startPos}
                    data-end={endPos}
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded-sm px-0.5 transition-colors duration-150"
                  >
                    <span className="float-left text-5xl font-semibold leading-[0.85] mr-2 mt-1.5 text-foreground">
                      {firstChar}
                    </span>
                    {rest}
                  </span>
                )
              }

              // All words are clickable - translations fetched on demand
              return (
                <span
                  key={tokenIndex}
                  onClick={onWordClick}
                  data-start={startPos}
                  data-end={endPos}
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded-sm px-0.5 transition-colors duration-150"
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
