interface ReadingProgressProps {
  progress: number
}

export function ReadingProgress({ progress }: ReadingProgressProps) {
  return (
    <div className="sticky top-0 z-10 w-full h-[3px] bg-border/30">
      <div
        className="h-full bg-primary/70 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}
