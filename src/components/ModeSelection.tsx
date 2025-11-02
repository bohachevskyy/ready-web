import { BookOpen, Brain } from "lucide-react"
import { Card } from "./ui/card"

interface ModeSelectionProps {
  onSelectMode: (mode: "read" | "practice") => void
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Choose Your Learning Mode</h1>
          <p className="mt-2 text-muted-foreground">Select how you'd like to practice today</p>
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
                <h2 className="text-2xl font-bold text-foreground">Read Stories</h2>
                <p className="mt-2 text-muted-foreground">
                  Improve your reading comprehension with interactive stories
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
              <div className="rounded-2xl bg-primary/10 p-6 transition-colors group-hover:bg-primary/20">
                <Brain className="h-16 w-16 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Practice Words</h2>
                <p className="mt-2 text-muted-foreground">Build your vocabulary with targeted word exercises</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
