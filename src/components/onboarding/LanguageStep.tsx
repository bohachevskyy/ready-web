import { ChevronLeft } from "lucide-react"
import { Button } from "../ui/button"

interface LanguageStepProps {
  selectedLanguage: string
  onLanguageSelect: (language: string) => void
  onBack: () => void
}

const languages = [
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
]

export function LanguageStep({ selectedLanguage, onLanguageSelect, onBack }: LanguageStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">What's your native language?</h2>
        <p className="text-sm text-muted-foreground mt-2">We'll show translations in this language</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onLanguageSelect(lang.name)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all hover:border-primary/50 hover:bg-muted ${
              selectedLanguage === lang.name ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </button>
        ))}
      </div>

      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </div>
  )
}
