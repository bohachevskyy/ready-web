import * as React from 'react'
import { Volume2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useAppSelector } from '../../store/store'
import { Button } from './button'

export interface SpeakerButtonProps extends React.ComponentProps<'button'> {
  text: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export function SpeakerButton({
  text,
  size = 'default',
  variant = 'ghost',
  className,
  ...props
}: SpeakerButtonProps) {
  const { speak, speaking, supported } = useSpeechSynthesis()
  const { speechRate, selectedVoice } = useAppSelector(state => state.speechSettings)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (text && supported) {
      speak(text, { rate: speechRate, voice: selectedVoice || undefined })
    }
  }

  if (!supported) {
    return null
  }

  const iconSizeMap = {
    sm: 'size-4',
    default: 'size-5',
    lg: 'size-6',
  }

  const buttonSizeMap = {
    sm: 'icon-sm' as const,
    default: 'icon' as const,
    lg: 'icon-lg' as const,
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={buttonSizeMap[size]}
      onClick={handleClick}
      disabled={!text || !supported}
      className={cn(
        'transition-all',
        speaking && 'animate-pulse',
        className
      )}
      title="Pronounce word"
      {...props}
    >
      {speaking ? (
        <Volume2 className={cn(iconSizeMap[size], 'text-primary')} />
      ) : (
        <Volume2 className={iconSizeMap[size]} />
      )}
    </Button>
  )
}
