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
        'bricolage': ['var(--font-bricolage-grotesque)', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        'blubeez-blue': '#2d4e92',
        'blubeez-dark': '#132341',
        'blubeez-navy': '#2f4f93',
      },
    },
  },
  plugins: [],
};
export default config;

