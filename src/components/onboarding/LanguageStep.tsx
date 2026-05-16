import { useTranslation } from "../../i18n/useTranslation"
import { cn } from "../../lib/utils"

interface LanguageStepProps {
  selectedLanguage: string
  onLanguageSelect: (language: string) => void
  onBack: () => void
}

const languageCodes = [
  { code: "zh", flag: "🇨🇳" },
  { code: "hi", flag: "🇮🇳" },
  { code: "es", flag: "🇪🇸" },
  { code: "ar", flag: "🇸🇦" },
  { code: "fr", flag: "🇫🇷" },
  { code: "bn", flag: "🇧🇩" },
  { code: "pt", flag: "🇵🇹" },
  { code: "ru", flag: "🇷🇺" },
  { code: "ja", flag: "🇯🇵" },
  { code: "de", flag: "🇩🇪" },
  { code: "ko", flag: "🇰🇷" },
  { code: "vi", flag: "🇻🇳" },
  { code: "tr", flag: "🇹🇷" },
  { code: "it", flag: "🇮🇹" },
  { code: "pl", flag: "🇵🇱" },
  { code: "uk", flag: "🇺🇦" },
  { code: "nl", flag: "🇳🇱" },
  { code: "th", flag: "🇹🇭" },
  { code: "id", flag: "🇮🇩" },
  { code: "ms", flag: "🇲🇾" },
]

export function LanguageStep({ selectedLanguage, onLanguageSelect, onBack }: LanguageStepProps) {
  const { t } = useTranslation()

  const languages = languageCodes.map((lang) => ({
    ...lang,
    name: t(`data.languages.${lang.code}`),
  }))

  return (
    <div>
      <h2 className="font-black text-[26px] m-0 text-center">
        {t("onboarding.language.question")}
      </h2>
      <p className="text-ink-soft text-[15px] text-center mt-2 mb-6">
        {t("onboarding.language.description")}
      </p>

      <div className="grid grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-1 scroll-cream">
        {languages.map((lang) => {
          const on = selectedLanguage === lang.code
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageSelect(lang.code)}
              className={cn(
                "flex items-center gap-3 rounded-[14px] px-4 py-3.5 text-left cursor-pointer font-sans",
                "border-2 transition-[transform,box-shadow]",
                on
                  ? "bg-green-soft border-green shadow-[0_4px_0_hsl(var(--green-deep))]"
                  : "bg-paper border-line shadow-[0_4px_0_hsl(var(--line-2))]",
              )}
            >
              <span className="text-2xl leading-none">{lang.flag}</span>
              <span className={cn("font-extrabold", on ? "text-green-ink" : "text-ink")}>
                {lang.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onBack}
          className="bg-transparent border-0 cursor-pointer text-ink-soft font-bold text-[15px] px-2 py-2"
        >
          {t("common.back")}
        </button>
      </div>
    </div>
  )
}
