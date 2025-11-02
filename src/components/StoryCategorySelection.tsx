import { Card } from "./ui/card"
import {
  BookOpen,
  Sparkles,
  Compass,
  Search,
  Wand2,
  Rocket,
  Laugh,
  Heart,
  Briefcase,
  TrendingUp,
  Home,
  UtensilsCrossed,
  Clock,
  Microscope,
  Atom,
  Globe,
  Cpu,
  Palette,
  User,
  Brain,
} from "lucide-react"

type StoryDomain = string

interface StoryCategorySelectionProps {
  onSelectDomain: (domain: StoryDomain) => void
}

const NONFICTION_DOMAINS = {
  history: {
    name: "History & Archaeology",
    icon: Clock,
    description: "Historical events, ancient civilizations",
  },
  biology: {
    name: "Biology & Medicine",
    icon: Microscope,
    description: "Animals, ecosystems, human body, health",
  },
  physics: { name: "Physics & Engineering", icon: Atom, description: "Space, physics, how machines work" },
  earth: {
    name: "Earth & Environment",
    icon: Globe,
    description: "Nature, climate, weather, conservation",
  },
  technology: {
    name: "Technology & Innovation",
    icon: Cpu,
    description: "Inventions, technological breakthroughs",
  },
  art: {
    name: "Art, Literature & Culture",
    icon: Palette,
    description: "Paintings, books, artistic movements",
  },
  biography: {
    name: "Biography & Achievement",
    icon: User,
    description: "Stories of scientists, explorers, inventors",
  },
  psychology: { name: "Psychology & Behavior", icon: Brain, description: "Cognitive science, human behavior" },
}

const FICTION_DOMAINS = {
  adventure_quest: { name: "Adventure & Quest", icon: Compass, description: "Journeys, treasure hunts, exploration" },
  mystery_detective: { name: "Mystery & Detective", icon: Search, description: "Solving crimes, uncovering secrets" },
  fantasy_magic: { name: "Fantasy & Magic", icon: Wand2, description: "Magical worlds, mythical creatures" },
  sci_fi_future: { name: "Sci-Fi & Future", icon: Rocket, description: "Space adventures, time travel, robots" },
  humor_comedy: { name: "Humor & Comedy", icon: Laugh, description: "Funny situations, silly characters" },
}

const EVERYDAY_DOMAINS = {
  relationships: { name: "Relationships", icon: Heart, description: "Romance, dating, friendship, family" },
  work_career: { name: "Work & Career", icon: Briefcase, description: "Jobs, workplace scenarios, career decisions" },
  personal_growth: { name: "Personal Growth", icon: TrendingUp, description: "Self-improvement, overcoming obstacles" },
  home_lifestyle: { name: "Home & Lifestyle", icon: Home, description: "Daily routines, family life, community" },
  food_culture: {
    name: "Food & Culture",
    icon: UtensilsCrossed,
    description: "Cooking adventures, culinary traditions",
  },
}

export function StoryCategorySelection({ onSelectDomain }: StoryCategorySelectionProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Story Domain</h1>
          <p className="text-muted-foreground">Select a topic to start reading</p>
        </div>

        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Nonfiction</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {Object.entries(NONFICTION_DOMAINS).map(([key, domain]) => {
                const Icon = domain.icon
                return (
                  <Card
                    key={key}
                    className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                    onClick={() => onSelectDomain(key)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{domain.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Fiction</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {Object.entries(FICTION_DOMAINS).map(([key, domain]) => {
                const Icon = domain.icon
                return (
                  <Card
                    key={key}
                    className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                    onClick={() => onSelectDomain(key)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{domain.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Everyday Life</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {Object.entries(EVERYDAY_DOMAINS).map(([key, domain]) => {
                const Icon = domain.icon
                return (
                  <Card
                    key={key}
                    className="group cursor-pointer border-2 border-border bg-card p-6 transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg w-full max-w-xs"
                    onClick={() => onSelectDomain(key)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{domain.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
