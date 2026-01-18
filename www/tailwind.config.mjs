/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ink: "hsl(155 10% 13%)",
        muted: "hsl(155 10% 48%)",
        accent: "hsl(145 66% 58%)",
        surface: "#ffffff",
        soft: "hsl(155 20% 93%)",
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
