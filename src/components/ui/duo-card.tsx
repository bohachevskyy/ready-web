import * as React from 'react'
import { cn } from '../../lib/utils'

type DuoCardProps = React.HTMLAttributes<HTMLDivElement>

export const DuoCard = React.forwardRef<HTMLDivElement, DuoCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-paper border-2 border-line rounded-[22px]',
          'shadow-[0_1px_0_rgba(0,0,0,.04),0_4px_0_hsl(var(--line))]',
          className,
        )}
        {...props}
      />
    )
  },
)
DuoCard.displayName = 'DuoCard'
