/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f1a",
        muted: "#5b6270",
        accent: "#3b82f6",
        surface: "#f8fafc",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 40px -24px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
