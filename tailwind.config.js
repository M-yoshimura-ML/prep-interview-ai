//import { heroui } from "@heroui/react";
import { heroui, theme } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: theme, // Extend with HeroUI theme tokens
  },
  darkMode: "class",
  plugins: [heroui()],
}

