import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const duoButtonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2',
    'border-0 cursor-pointer select-none',
    'font-sans font-extrabold uppercase tracking-wider',
    'rounded-[14px] transition-[transform,box-shadow,filter] duration-75',
    'hover:brightness-105',
    'active:translate-y-[3px]',
    'disabled:pointer-events-none disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-green text-white shadow-[0_5px_0_hsl(var(--green-deep))] active:shadow-[0_2px_0_hsl(var(--green-deep))]',
        secondary:
          'bg-paper text-ink border-2 border-line shadow-[0_5px_0_hsl(var(--line-2))] active:shadow-[0_2px_0_hsl(var(--line-2))] hover:brightness-100',
        gold: 'bg-gold text-[#5B3D00] shadow-[0_5px_0_hsl(var(--gold-deep))] active:shadow-[0_2px_0_hsl(var(--gold-deep))]',
        blue: 'bg-brand-blue text-white shadow-[0_5px_0_hsl(var(--blue-deep))] active:shadow-[0_2px_0_hsl(var(--blue-deep))]',
        purple: 'bg-brand-purple text-white shadow-[0_5px_0_hsl(var(--purple-deep))] active:shadow-[0_2px_0_hsl(var(--purple-deep))]',
        danger: 'bg-heart text-white shadow-[0_5px_0_hsl(var(--heart-deep))] active:shadow-[0_2px_0_hsl(var(--heart-deep))]',
        ghost:
          'bg-transparent text-brand-blue-deep shadow-none normal-case tracking-normal active:translate-y-0 hover:bg-cream-2/40',
      },
      size: {
        sm: 'min-h-[38px] px-4 py-2.5 text-[13px] rounded-[12px]',
        md: 'min-h-[50px] px-[22px] py-[14px] text-[15px]',
        lg: 'min-h-[60px] px-7 py-[18px] text-[17px] rounded-[16px]',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
    },
  },
)

type DuoButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof duoButtonVariants>

export const DuoButton = React.forwardRef<HTMLButtonElement, DuoButtonProps>(
  ({ className, variant, size, block, disabled, ...props }, ref) => {
    const isDisabled = !!disabled
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          duoButtonVariants({ variant, size, block }),
          isDisabled &&
            'bg-[#E5E0D0] text-[#B7B19F] shadow-[0_5px_0_#CFC9B6] hover:brightness-100 active:translate-y-0 active:shadow-[0_5px_0_#CFC9B6]',
          className,
        )}
        {...props}
      />
    )
  },
)
DuoButton.displayName = 'DuoButton'

export { duoButtonVariants }
