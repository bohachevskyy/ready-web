import { cn } from '../../lib/utils'

export interface LevelOption {
  id: string
  name: string
  desc?: string
}

interface LevelSliderProps {
  levels: LevelOption[]
  value: number
  onChange: (index: number) => void
  className?: string
}

export function LevelSlider({ levels, value, onChange, className }: LevelSliderProps) {
  const last = levels.length - 1
  const filledPct = (value / last) * 100

  return (
    <div className={cn('px-1 pt-5', className)}>
      {/* Track */}
      <div className="relative h-8">
        {/* base track */}
        <div className="absolute left-0 right-0 top-3.5 h-2 bg-[#EAE2C8] rounded-full" />
        {/* filled */}
        <div
          className="absolute left-0 top-3.5 h-2 bg-green rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${filledPct}%` }}
        />
        {/* dots */}
        {levels.map((l, i) => {
          const filled = i <= value
          const active = i === value
          return (
            <button
              key={l.id}
              type="button"
              aria-label={`Set level ${l.id}`}
              onClick={() => onChange(i)}
              className={cn(
                'absolute top-1.5 w-6 h-6 rounded-full transition-all',
                filled ? 'bg-green' : 'bg-line',
                active && 'border-[3px] border-white',
              )}
              style={{
                left: `calc(${(i / last) * 100}% - 12px)`,
                boxShadow: active
                  ? '0 0 0 3px hsl(var(--green)), 0 4px 0 hsl(var(--green-deep))'
                  : filled
                  ? '0 2px 0 hsl(var(--green-deep))'
                  : 'none',
              }}
            />
          )
        })}
      </div>

      {/* Labels */}
      <div
        className="grid mt-4"
        style={{ gridTemplateColumns: `repeat(${levels.length}, 1fr)` }}
      >
        {levels.map((l, i) => {
          const on = i === value
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                'border-0 rounded-[10px] px-1 py-1.5 cursor-pointer text-center font-sans',
                on ? 'bg-green-soft' : 'bg-transparent',
              )}
            >
              <div
                className={cn(
                  'text-[11px] font-black tracking-wide',
                  on ? 'text-green-ink' : 'text-ink-mute',
                )}
              >
                {l.id}
              </div>
              <div
                className={cn(
                  'text-[11px] font-bold mt-0.5 leading-tight',
                  on ? 'text-green-ink' : 'text-ink-soft',
                )}
              >
                {l.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
