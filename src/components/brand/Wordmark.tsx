import { cn } from '../../lib/utils'

interface WordmarkProps {
  size?: number
  className?: string
}

export function Wordmark({ size = 26, className }: WordmarkProps) {
  return (
    <span className={cn('wordmark', className)} style={{ fontSize: size }}>
      Reader
      <span className="wordmark-dot" aria-hidden="true" />
      ly
    </span>
  )
}
