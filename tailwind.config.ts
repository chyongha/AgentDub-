import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        obsidian: {
          DEFAULT: "#0a0a0f",
          50: "#f0f0ff",
          100: "#e0e0ff",
          900: "#0a0a0f",
          950: "#05050a",
        },
        volt: {
          DEFAULT: "#c8f135",
          light: "#d8ff45",
          dark: "#a8d015",
        },
        ash: {
          DEFAULT: "#8888a0",
          light: "#b0b0c8",
          dark: "#555568",
        },
      },
      backgroundImage: {
        "noise": "url('/noise.svg')",
        "grid-subtle": "linear-gradient(rgba(200,241,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,241,53,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
