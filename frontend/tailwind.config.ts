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
        ink: "#111827",
        ember: "#f97316",
        sunrise: "#fde68a",
        mist: "#eff6ff",
        slateblue: "#1e3a8a",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        card: "0 16px 50px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at top left, rgba(249, 115, 22, 0.15), transparent 30%), radial-gradient(circle at bottom right, rgba(30, 58, 138, 0.18), transparent 32%)",
      },
    },
  },
  plugins: [],
};

export default config;
