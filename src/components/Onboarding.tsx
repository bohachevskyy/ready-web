import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../store/store"
import { clearAuth } from "../store/authSlice"
import { signOut } from "../services/firebaseAuth"
import { persistor } from "../store/store"
import { OnboardingForm } from "./OnboardingForm"
import { Wordmark } from "./brand/Wordmark"
import { useTranslation } from "../i18n/useTranslation"

export function Onboarding() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleSaveExit = async () => {
    try {
      await signOut()
      dispatch(clearAuth())
      await persistor.purge()
      navigate("/login")
    } catch (err) {
      console.error("Error signing out:", err)
      navigate("/login")
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #FFFBF0 0%, hsl(var(--cream)) 60%, #FFF1D0 100%)",
      }}
    >
      <header className="flex items-center gap-4 px-7 py-[18px]">
        <Wordmark size={24} />
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSaveExit}
          className="bg-transparent border-0 cursor-pointer font-extrabold text-[13px] text-ink-soft hover:text-ink px-2.5 py-2 rounded"
        >
          {t("onboarding.saveExit") || "Save & exit"}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pb-16">
        <OnboardingForm onComplete={() => navigate("/")} />
      </main>
    </div>
  )
}
