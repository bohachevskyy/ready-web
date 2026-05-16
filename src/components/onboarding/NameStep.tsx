import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"
import { DuoButton } from "../ui/duo-button"
import { cn } from "../../lib/utils"

interface NameStepProps {
  firstName: string
  lastName: string
  onFirstNameChange: (firstName: string) => void
  onLastNameChange: (lastName: string) => void
  onNext: () => void
  onBack?: () => void
}

export function NameStep({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onNext,
  onBack,
}: NameStepProps) {
  const { t } = useTranslation()
  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0

  return (
    <div>
      <h2 className="font-black text-[26px] m-0 text-center">{t("onboarding.name.question")}</h2>
      <p className="text-ink-soft text-[15px] text-center mt-2 mb-7">
        {t("onboarding.name.description")}
      </p>

      <div className="grid grid-cols-2 gap-3.5">
        <NamedInput
          label={t("onboarding.name.firstName")}
          value={firstName}
          onChange={onFirstNameChange}
          autoFocus
        />
        <NamedInput
          label={t("onboarding.name.lastName")}
          value={lastName}
          onChange={onLastNameChange}
        />
      </div>

      <DuoButton size="lg" block className="mt-6" disabled={!isValid} onClick={onNext}>
        {t("common.continue")} <ChevronRight className="h-[18px] w-[18px]" />
      </DuoButton>

      {onBack && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onBack}
            className="bg-transparent border-0 cursor-pointer text-ink-soft font-bold text-[15px] px-2 py-2"
          >
            {t("common.back")}
          </button>
        </div>
      )}
    </div>
  )
}

function NamedInput({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <label className="block">
      <div className="text-sm font-extrabold mb-1.5">{label}</div>
      <input
        type="text"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full px-4 py-3.5 bg-[#FAF6E8] rounded-[12px] outline-none",
          "text-base font-semibold transition-[border-color,box-shadow]",
          "border-2",
          focused ? "border-green shadow-[0_0_0_4px_hsl(var(--green-soft))]" : "border-line",
        )}
      />
    </label>
  )
}
