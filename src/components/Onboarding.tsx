import { useNavigate } from "react-router-dom"
import { Card } from "./ui/card"
import { OnboardingForm } from "./OnboardingForm"

export function Onboarding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-8 bg-card shadow-lg">
        <OnboardingForm onComplete={() => navigate("/")} />
      </Card>
    </div>
  )
}
