import { BookOpen, Brain } from "lucide-react"
import { Card } from "./ui/card"
import { useWordCount } from "../hooks/useWordCount"
import { useTranslation } from "../i18n/useTranslation"

interface ModeSelectionProps {
  onSelectMode: (mode: "read" | "practice") => void
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const { wordsCount } = useWordCount()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('modeSelection.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('modeSelection.description')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Read Stories Button */}
          <Card
            className="group cursor-pointer border-2 transition-all hover:scale-[1.02] hover:border-primary hover:shadow-lg"
            onClick={() => onSelectMode("read")}
          >
            <div className="flex flex-col items-center gap-6 p-8 text-center">
              <div className="rounded-2xl bg-primary/10 p-6 transition-colors group-hover:bg-primary/20">
                <BookOpen className="h-16 w-16 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('modeSelection.readStories')}</h2>
                <p className="mt-2 text-muted-foreground">
                  {t('modeSelection.readStoriesDescription')}
                </p>
              </div>
            </div>
          </Card>

          {/* Practice Words Button */}
          <Card
            className="group cursor-pointer border-2 transition-all hover:scale-[1.02] hover:border-primary hover:shadow-lg"
            onClick={() => onSelectMode("practice")}
          >
            <div className="flex flex-col items-center gap-6 p-8 text-center">
              <div className="relative rounded-2xl bg-primary/10 p-6 transition-colors group-hover:bg-primary/20">
                <Brain className="h-16 w-16 text-primary" strokeWidth={1.5} />
                {wordsCount > 0 && (
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-500 text-sm font-bold text-white shadow-md">
                    {wordsCount}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('modeSelection.practiceWords')}</h2>
                <p className="mt-2 text-muted-foreground">{t('modeSelection.practiceWordsDescription')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
