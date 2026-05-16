import { Check } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"
import { DuoButton } from "../ui/duo-button"
import { LevelSlider, type LevelOption } from "./LevelSlider"
import { LevelBadge } from "../brand/icons"

interface DifficultyStepProps {
  languageLevel: number
  onLevelChange: (level: number) => void
  onComplete: () => void
  onBack: () => void
  isLoading?: boolean
}

export function DifficultyStep({
  languageLevel,
  onLevelChange,
  onComplete,
  onBack,
  isLoading,
}: DifficultyStepProps) {
  const { t, tObject } = useTranslation()
  const levelsObj = tObject("data.levels")

  const levels: LevelOption[] = Object.entries(levelsObj).map(([, value]) => ({
    id: value.label,
    name: value.description,
  }))

  const idx = Math.max(0, Math.min(levels.length - 1, languageLevel - 1))
  const lvl = levels[idx]

  return (
    <div>
      <h2 className="font-black text-[26px] m-0 text-center">
        {t("onboarding.difficulty.question")}
      </h2>
      <p className="text-ink-soft text-[15px] text-center mt-2 mb-5">
        {t("onboarding.difficulty.description")}
      </p>

      {/* Selected level preview */}
      <div className="bg-green-soft border-2 border-[#BBE3A0] rounded-[14px] px-5 py-5 flex items-center gap-4">
        <LevelBadge level={lvl.id} />
        <div className="flex-1">
          <div className="text-[20px] font-black text-green-ink">{lvl.name}</div>
          <div className="text-ink-soft text-[13px] mt-0.5">
            {t("onboarding.difficulty.levelProgress", { level: idx + 1 })}
          </div>
        </div>
      </div>

      <LevelSlider
        levels={levels}
        value={idx}
        onChange={(i) => onLevelChange(i + 1)}
      />

      <DuoButton size="lg" block className="mt-5" onClick={onComplete} disabled={isLoading}>
        <Check className="h-[18px] w-[18px]" />
        {isLoading ? t("common.saving") : t("onboarding.difficulty.startLearning")}
      </DuoButton>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="bg-transparent border-0 cursor-pointer text-ink-soft font-bold text-[15px] px-2 py-2 disabled:opacity-50"
        >
          {t("common.back")}
        </button>
      </div>
    </div>
  )
}
