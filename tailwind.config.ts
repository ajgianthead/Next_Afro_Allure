import type { Config } from "tailwindcss";
import { animations, components, palettes, rounded, shade } from "@tailus/themer"


const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@tailus/themer/dist/components/**/*.{js,ts}',
  ],
  darkMode: undefined,
  theme: {
    extend: {
      colors: ({ colors }) => ({
        ...palettes.trust,
        primary: colors.indigo,

      }),
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    rounded,
    shade,
    components,
    animations
  ],
};
export default config;
