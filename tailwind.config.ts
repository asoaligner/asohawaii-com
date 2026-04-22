import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#0F2942",
          light: "#1E3A5F",
        },
        brandOrange: {
          DEFAULT: "#F97316",
          light: "#FED7AA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // `font-serif` Tailwind utility → Source Serif 4 (neutral classical).
        // Fraunces is scoped to the Claude variant only.
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      letterSpacing: {
        tighter: "-0.02em",
        tightest: "-0.03em",
      },
    },
  },
  plugins: [],
};
export default config;
