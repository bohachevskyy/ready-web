/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"SF Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
        },
        // Brand surfaces
        cream: "hsl(var(--cream))",
        "cream-2": "hsl(var(--cream-2))",
        paper: "hsl(var(--paper))",
        ink: {
          DEFAULT: "hsl(var(--ink))",
          soft: "hsl(var(--ink-soft))",
          mute: "hsl(var(--ink-mute))",
        },
        line: {
          DEFAULT: "hsl(var(--line))",
          2: "hsl(var(--line-2))",
        },
        // Brand accents
        green: {
          DEFAULT: "hsl(var(--green))",
          deep: "hsl(var(--green-deep))",
          soft: "hsl(var(--green-soft))",
          ink: "hsl(var(--green-ink))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          deep: "hsl(var(--gold-deep))",
          soft: "hsl(var(--gold-soft))",
        },
        flame: {
          DEFAULT: "hsl(var(--flame))",
          deep: "hsl(var(--flame-deep))",
        },
        heart: {
          DEFAULT: "hsl(var(--heart))",
          deep: "hsl(var(--heart-deep))",
        },
        brand: {
          blue: "hsl(var(--blue))",
          "blue-deep": "hsl(var(--blue-deep))",
          "blue-soft": "hsl(var(--blue-soft))",
          purple: "hsl(var(--purple))",
          "purple-deep": "hsl(var(--purple-deep))",
          "purple-soft": "hsl(var(--purple-soft))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 6px)",
        "2xl": "calc(var(--radius) + 12px)",
      },
      boxShadow: {
        // 3D-button bottom-shadow trick
        "duo": "0 5px 0 hsl(var(--green-deep))",
        "duo-press": "0 2px 0 hsl(var(--green-deep))",
        "duo-line": "0 1px 0 rgba(0,0,0,.04), 0 4px 0 hsl(var(--line))",
      },
    },
  },
  plugins: [],
}
