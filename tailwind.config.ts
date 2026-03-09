import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F1B2D",
          light: "#1A2A42",
          dark: "#080D14",
        },
        teal: {
          DEFAULT: "#00D4AA",
          dark: "#00B894",
          light: "#55EFC4",
        },
        amber: {
          DEFAULT: "#FFB347",
          dark: "#E89B2E",
          light: "#FFD89B",
        },
      },
      fontFamily: {
        heading: ["var(--font-nunito)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
