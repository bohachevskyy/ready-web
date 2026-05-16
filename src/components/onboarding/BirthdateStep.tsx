import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { useTranslation } from "../../i18n/useTranslation"
import { DuoButton } from "../ui/duo-button"
import { cn } from "../../lib/utils"

interface BirthdateStepProps {
  birthMonth: number
  birthYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onNext: () => void
  onBack?: () => void
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 96 }, (_, i) => currentYear - 5 - i)

export function BirthdateStep({
  birthMonth,
  birthYear,
  onMonthChange,
  onYearChange,
  onNext,
  onBack,
}: BirthdateStepProps) {
  const { t, tArray } = useTranslation()
  const months = tArray("data.months")

  const calculateAgeGroup = (year: number): string => {
    const age = currentYear - year
    if (age >= 10 && age <= 14) return "10-14"
    if (age >= 15 && age <= 17) return "15-17"
    return "18+"
  }

  const isValid = birthMonth > 0 && birthYear > 0

  return (
    <div>
      <h2 className="font-black text-[26px] m-0 text-center">
        {t("onboarding.birthdate.question")}
      </h2>
      <p className="text-ink-soft text-[15px] text-center mt-2 mb-7">
        {t("onboarding.birthdate.description")}
      </p>

      <div className="grid grid-cols-2 gap-3.5">
        <NamedSelect
          label={t("onboarding.birthdate.month")}
          value={birthMonth}
          onChange={(v) => onMonthChange(Number(v))}
          options={[
            { value: 0, label: t("onboarding.birthdate.selectMonth") },
            ...months.map((m, i) => ({ value: i + 1, label: m })),
          ]}
        />
        <NamedSelect
          label={t("onboarding.birthdate.year")}
          value={birthYear}
          onChange={(v) => onYearChange(Number(v))}
          options={[
            { value: 0, label: t("onboarding.birthdate.selectYear") },
            ...years.map((y) => ({ value: y, label: String(y) })),
          ]}
        />
      </div>

      <div
        className={cn(
          "mt-5 px-6 py-5 rounded-[14px] text-center transition-all border-2",
          isValid
            ? "bg-green-soft border-[#BBE3A0]"
            : "bg-[#FAF6E8] border-line",
        )}
      >
        <div className="text-ink-mute text-[13px] font-bold">{t("onboarding.birthdate.ageGroup")}</div>
        <div
          className={cn(
            "text-[22px] font-black mt-1",
            isValid ? "text-green-ink" : "text-ink-mute",
          )}
        >
          {birthYear > 0 ? calculateAgeGroup(birthYear) : "—"}
        </div>
      </div>

      <DuoButton size="lg" block className="mt-5" disabled={!isValid} onClick={onNext}>
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

function NamedSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  options: Array<{ value: number; label: string }>
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = value > 0
  return (
    <label className="block relative">
      <div className="text-sm font-extrabold mb-1.5">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full pl-4 pr-10 py-3.5 bg-[#FAF6E8] rounded-[12px] outline-none appearance-none cursor-pointer",
          "text-base font-semibold transition-[border-color,box-shadow]",
          "border-2",
          focused
            ? "border-green shadow-[0_0_0_4px_hsl(var(--green-soft))]"
            : hasValue
            ? "border-green"
            : "border-line",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3.5 text-ink-mute pointer-events-none"
        style={{ top: "calc(50% + 11px)" }}
        size={18}
      />
    </label>
  )
}
