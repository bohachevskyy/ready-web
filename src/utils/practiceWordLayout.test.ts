import { PRACTICE_WORD_ROW_CLASS, PRACTICE_WORD_TEXT_CLASS } from './practiceWordLayout'

describe('practice word layout classes', () => {
  it('keeps long practice words inside the card on narrow screens', () => {
    expect(PRACTICE_WORD_ROW_CLASS).toContain('flex-wrap')
    expect(PRACTICE_WORD_ROW_CLASS).toContain('min-w-0')

    expect(PRACTICE_WORD_TEXT_CLASS).toContain('max-w-full')
    expect(PRACTICE_WORD_TEXT_CLASS).toContain('min-w-0')
    expect(PRACTICE_WORD_TEXT_CLASS).toContain('break-words')
    expect(PRACTICE_WORD_TEXT_CLASS).toContain('[overflow-wrap:anywhere]')
    expect(PRACTICE_WORD_TEXT_CLASS).toContain('text-[clamp(2.5rem,13vw,4rem)]')
  })
})
