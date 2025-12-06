import { ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Label } from "../ui/label"

interface BirthdateStepProps {
  birthMonth: number
  birthYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onNext: () => void
  onBack?: () => void
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 96 }, (_, i) => currentYear - 5 - i) // Ages 5-100

export function BirthdateStep({
  birthMonth,
  birthYear,
  onMonthChange,
  onYearChange,
  onNext,
  onBack,
}: BirthdateStepProps) {
  const calculateAgeGroup = (year: number): string => {
    const age = currentYear - year
    if (age >= 10 && age <= 14) return "10-14"
    if (age >= 15 && age <= 17) return "15-17"
    return "18+"
  }

  const isValid = birthMonth > 0 && birthYear > 0

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">When were you born?</h2>
        <p className="text-sm text-muted-foreground mt-2">This helps us personalize your learning experience</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Month</Label>
          <select
            value={birthMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={0}>Select month</option>
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Year</Label>
          <select
            value={birthYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={0}>Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {birthYear > 0 && (
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Age group</p>
          <p className="text-lg font-semibold text-foreground">{calculateAgeGroup(birthYear)}</p>
        </div>
      )}

      <Button onClick={onNext} className="w-full" size="lg" disabled={!isValid}>
        Continue
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>

      {onBack && (
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Back
        </Button>
      )}
    </div>
  )
}
