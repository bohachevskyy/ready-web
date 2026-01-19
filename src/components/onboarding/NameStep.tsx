import { ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useTranslation } from "../../i18n/useTranslation"

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
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">{t('onboarding.name.question')}</h2>
        <p className="text-sm text-muted-foreground mt-2">{t('onboarding.name.description')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('onboarding.name.firstName')}</Label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder={t('onboarding.name.firstName')}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('onboarding.name.lastName')}</Label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder={t('onboarding.name.lastName')}
            className="w-full"
          />
        </div>
      </div>

      <Button onClick={onNext} className="w-full" size="lg" disabled={!isValid}>
        {t('common.continue')}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>

      {onBack && (
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          {t('common.back')}
        </Button>
      )}
    </div>
  )
}
