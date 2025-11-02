import { useEffect, useState } from "react"
import { BookOpen, Sparkles, Coffee, Utensils, Heart, Compass, Wand2, Palette } from "lucide-react"

export function StoryLoading() {
  const [activeIcon, setActiveIcon] = useState(0)

  const icons = [
    { Icon: BookOpen, color: "text-green-500", label: "Books" },
    { Icon: Sparkles, color: "text-yellow-500", label: "Magic" },
    { Icon: Coffee, color: "text-amber-600", label: "Everyday" },
    { Icon: Utensils, color: "text-orange-500", label: "Food" },
    { Icon: Heart, color: "text-red-500", label: "Family" },
    { Icon: Compass, color: "text-blue-500", label: "Adventure" },
    { Icon: Wand2, color: "text-purple-500", label: "Fantasy" },
    { Icon: Palette, color: "text-pink-500", label: "Arts" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcon((prev) => (prev + 1) % icons.length)
    }, 300)

    return () => clearInterval(interval)
  }, [icons.length])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center">
        {/* Animated icon circle */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Outer rotating ring */}
          <div
            className="absolute inset-0 border-4 border-green-200 rounded-full animate-spin"
            style={{ animationDuration: "3s" }}
          />

          {/* Icons arranged in a circle */}
          {icons.map((item, index) => {
            const angle = (index / icons.length) * 2 * Math.PI
            const x = Math.cos(angle) * 70
            const y = Math.sin(angle) * 70
            const Icon = item.Icon

            return (
              <div
                key={index}
                className={`absolute top-1/2 left-1/2 transition-all duration-300 ${
                  activeIcon === index ? "scale-150 opacity-100" : "scale-100 opacity-40"
                }`}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <Icon className={`w-8 h-8 ${item.color}`} />
              </div>
            )
          })}

          {/* Center pulsing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Your Story</h2>
        <p className="text-gray-600">Preparing an amazing reading experience...</p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
