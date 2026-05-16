import type React from "react"
import { DuoButton } from "../ui/duo-button"
import { useTranslation } from "../../i18n/useTranslation"

interface StoryContentProps {
  storyText: string
  storyError: string | null
  onWordClick: (event: React.MouseEvent) => void
  savedWords?: Array<{ word: string }>
}

export function StoryContent({ storyText, storyError, onWordClick, savedWords = [] }: StoryContentProps) {
  const { t } = useTranslation()
  const savedSet = new Set(savedWords.map((w) => w.word.toLowerCase()))

  if (storyError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-heart-deep mb-4 font-bold">{t('storyReader.failedLoad') || 'Failed to load story'}</p>
        <DuoButton onClick={() => window.location.reload()}>Try Again</DuoButton>
      </div>
    )
  }

  const lines = storyText.split('\n')
  let currentPosition = 0

  const nonEmptyLines: { line: string; originalIndex: number }[] = []
  lines.forEach((line, idx) => {
    if (line.trim()) nonEmptyLines.push({ line, originalIndex: idx })
  })

  return (
    <div className="font-serif text-[21px] leading-[1.65] text-ink space-y-6">
      {lines.map((line, lineIndex) => {
        const tokens = line.split(/(\s+|[.,!?;:"""''()[\]{}]+)/)
        const isFirstParagraph =
          line.trim() && nonEmptyLines.length > 0 && nonEmptyLines[0].originalIndex === lineIndex

        const lineContent = (
          <p key={lineIndex} className={line.trim() ? 'm-0' : 'hidden'}>
            {tokens.map((token, tokenIndex) => {
              if (!token) return null

              const startPos = currentPosition
              const endPos = currentPosition + token.length
              currentPosition = endPos

              if (token.match(/^\s+$/)) return <span key={tokenIndex}>{token}</span>
              if (token.match(/^[.,!?;:"""''()[\]{}]+$/)) return <span key={tokenIndex}>{token}</span>

              const cleanWord = token.toLowerCase().replace(/[^a-z']/g, '')
              const isSaved = savedSet.has(cleanWord)
              const wordCls = isSaved
                ? 'cursor-pointer rounded-[3px] px-[3px] py-[1px] transition-colors duration-150 bg-green-soft border-b-2 border-green hover:brightness-95'
                : 'cursor-pointer rounded-[3px] px-[3px] py-[1px] transition-colors duration-150 hover:bg-[rgba(245,195,65,.22)] hover:border-b-2 hover:border-gold-deep border-b-2 border-transparent'

              if (isFirstParagraph && tokenIndex === 0) {
                const firstChar = token.charAt(0)
                const rest = token.slice(1)
                return (
                  <span
                    key={tokenIndex}
                    onClick={onWordClick}
                    data-start={startPos}
                    data-end={endPos}
                    className={wordCls}
                  >
                    <span className="float-left text-[72px] font-bold leading-[.85] mr-2 mt-1.5 text-ink font-serif">
                      {firstChar}
                    </span>
                    {rest}
                  </span>
                )
              }

              return (
                <span
                  key={tokenIndex}
                  onClick={onWordClick}
                  data-start={startPos}
                  data-end={endPos}
                  className={wordCls}
                >
                  {token}
                </span>
              )
            })}
          </p>
        )

        if (lineIndex < lines.length - 1) currentPosition += 1

        return lineContent
      })}
    </div>
  )
}
