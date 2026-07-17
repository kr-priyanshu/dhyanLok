import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          bg: "var(--theme-bg)",
          panel: "rgba(128, 128, 128, 0.05)",
          border: "rgba(128, 128, 128, 0.2)",
          text: "var(--theme-text)",
          muted: "rgba(128, 128, 128, 0.6)",
          accent: "var(--theme-accent, var(--theme-text))",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--theme-heading-font)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
