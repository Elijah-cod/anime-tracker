import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        muted: "var(--surface-muted)",
        ink: "var(--ink)",
        subtle: "var(--muted)",
        line: "var(--border)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        card: "0 12px 30px color-mix(in oklch, var(--ink) 10%, transparent)",
        float: "0 8px 24px color-mix(in oklch, var(--ink) 12%, transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
