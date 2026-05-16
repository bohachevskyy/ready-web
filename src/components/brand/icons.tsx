import { cn } from '../../lib/utils'

interface IconProps {
  size?: number
  className?: string
}

export function Flame({ size = 22, animate = true, className }: IconProps & { animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(animate && 'anim-flame', className)}
    >
      <defs>
        <linearGradient id="rdr-flame" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFD23F" />
          <stop offset="55%" stopColor="#FF8A2A" />
          <stop offset="100%" stopColor="#E54A0A" />
        </linearGradient>
      </defs>
      <path
        fill="url(#rdr-flame)"
        stroke="#C75A06"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M16 2c1 4 5 6 5 11a5 5 0 0 1-3 4.6c.3-1.4-.2-2.8-1.5-3.6-.3 2.4-1.7 3.4-3.5 4.5C10 19.4 8 17 8 13.5 8 9 12 8 13 4c.5 2 2 3 3 5Z"
      />
      <path
        fill="#FFD23F"
        opacity=".75"
        d="M16 12c.6 1.8 2.5 2.6 2.5 5a2.5 2.5 0 1 1-5 0c0-1.6 1.4-2.4 2.5-5Z"
      />
    </svg>
  )
}

export function Heart({ size = 22, full = true, className }: IconProps & { full?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <path
        fill={full ? '#FF4D5E' : '#F1E7D6'}
        stroke={full ? '#C72C3D' : '#CDC0A2'}
        strokeWidth="2"
        strokeLinejoin="round"
        d="M16 27S4 19.5 4 11.5C4 7 7.5 4 11 4c2.5 0 4 1.5 5 3 1-1.5 2.5-3 5-3 3.5 0 7 3 7 7.5C28 19.5 16 27 16 27Z"
      />
      {full && (
        <path
          fill="#fff"
          opacity=".4"
          d="M9 8c1-1 2.5-1.5 3.5-1.2-1 .3-2 1.2-2.5 2.5-.5 1.3-.4 2-.2 2.7C8.4 11.4 8 9.6 9 8Z"
        />
      )}
    </svg>
  )
}

export function Gem({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id="rdr-gem" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7AD7FF" />
          <stop offset="100%" stopColor="#1B86D9" />
        </linearGradient>
      </defs>
      <path
        fill="url(#rdr-gem)"
        stroke="#1473C2"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="m16 4 9 7-9 17L7 11l9-7Z"
      />
      <path fill="#fff" opacity=".5" d="M16 4 11 11h10L16 4Z" />
      <path fill="#fff" opacity=".25" d="m11 11 5 17V11h-5Z" />
    </svg>
  )
}

interface LevelBadgeProps {
  level: string
  size?: number
  className?: string
}

export function LevelBadge({ level, size = 64, className }: LevelBadgeProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-green text-white grid place-items-center font-extrabold tracking-tight',
        'shadow-[0_4px_0_hsl(var(--green-deep))]',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {level}
    </div>
  )
}
