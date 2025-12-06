import { Check, ChevronLeft } from "lucide-react"
import { Button } from "../ui/button"

interface DifficultyStepProps {
  languageLevel: number
  onLevelChange: (level: number) => void
  onComplete: () => void
  onBack: () => void
  isLoading?: boolean
}

type LanguageLevel = 1 | 2 | 3 | 4 | 5

const languageLevels = [
  { level: 1, label: "A1", color: "bg-emerald-400", description: "Beginner" },
  { level: 2, label: "A2", color: "bg-green-400", description: "Elementary" },
  { level: 3, label: "B1", color: "bg-yellow-400", description: "Intermediate" },
  { level: 4, label: "B2", color: "bg-orange-400", description: "Upper Intermediate" },
  { level: 5, label: "C1", color: "bg-red-400", description: "Advanced" },
]

export function DifficultyStep({ languageLevel, onLevelChange, onComplete, onBack, isLoading }: DifficultyStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">Choose your level</h2>
        <p className="text-sm text-muted-foreground mt-2">How comfortable are you with English?</p>
      </div>

      {/* Current Level Display */}
      <div className="flex items-center justify-center gap-4 rounded-xl bg-muted/50 p-6">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${
            languageLevels[languageLevel - 1].color
          } text-3xl font-bold text-white shadow-lg`}
        >
          {languageLevels[languageLevel - 1].label}
        </div>
        <div>
          <p className="text-2xl font-semibold">{languageLevels[languageLevel - 1].description}</p>
          <p className="text-sm text-muted-foreground">Level {languageLevel} of 5</p>
        </div>
      </div>

      {/* Custom Slider */}
      <div className="space-y-4">
        <div className="relative px-2">
          {/* Level markers */}
          <div className="mb-3 flex justify-between">
            {languageLevels.map((level) => (
              <div key={level.level} className="flex flex-col items-center gap-1">
                <div
                  className={`h-4 w-4 rounded-full transition-all ${
                    languageLevel >= level.level ? level.color : "bg-muted"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    languageLevel === level.level ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {level.label}
                </span>
              </div>
            ))}
          </div>

          {/* Slider track */}
          <div className="relative h-3 rounded-full bg-muted">
            {/* Progress bar */}
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                languageLevels[languageLevel - 1].color
              }`}
              style={{ width: `${((languageLevel - 1) / 4) * 100}%` }}
            />
          </div>

          {/* Actual slider input */}
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={languageLevel}
            onChange={(e) => onLevelChange(Number(e.target.value) as LanguageLevel)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            disabled={isLoading}
          />
        </div>

        {/* Level descriptions */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {languageLevels.map((level) => (
            <button
              key={level.level}
              onClick={() => onLevelChange(level.level as LanguageLevel)}
              className={`rounded-lg p-2 text-xs transition-colors ${
                languageLevel === level.level
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              disabled={isLoading}
              type="button"
            >
              {level.description}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onComplete} className="w-full" size="lg" disabled={isLoading}>
        <Check className="h-4 w-4 mr-2" />
        {isLoading ? "Saving..." : "Start Learning"}
      </Button>

      <Button type="button" variant="ghost" className="w-full" onClick={onBack} disabled={isLoading}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </div>
  )
}
