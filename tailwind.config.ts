export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background layers
        "ink-950": "#09090b",
        "ink-900": "#121214",
        "ink-850": "#18181b",
        "ink-800": "#27272a",
        "ink-700": "#3f3f46",
        "ink-600": "#52525b",
        "ink-500": "#71717a",
        "ink-400": "#a1a1aa",
        "ink-300": "#d4d4d8",
        "ink-200": "#e4e4e7",
        "ink-100": "#f4f4f5",
        // Accent (Cyan for AI/model elements)
        "pulse-400": "#22d3ee",
        "pulse-500": "#06b6d4",
        "pulse-600": "#0891b2",
        // Warning (system messages)
        "warn-400": "#fbbf24",
        "warn-500": "#f59e0b",
        // Secondary accent
        "violet-400": "#a78bfa",
        "violet-500": "#8b5cf6",
        "violet-600": "#7c3aed",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        sans: ['"Spline Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "pulse-border": "pulse-border 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "typing": "typing 1.4s steps(4, end) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-border": {
          "0%, 100%": { borderColor: "rgba(6, 182, 212, 0.2)" },
          "50%": { borderColor: "rgba(6, 182, 212, 0.5)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "typing": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};