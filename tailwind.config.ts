import type { Config } from "tailwindcss";
import { animations, components, palettes, rounded, shade } from "@tailus/themer"

const { nextui } = require("@nextui-org/react");



const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@tailus/themer/dist/components/**/*.{js,ts}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "node_modules/react-responsive-iframe-viewer/**/*.{js,ts,jsx,tsx,html}",

  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f3f4fb',
          '100': '#e4e6f5',
          '200': '#ced3ef',
          '300': '#adb6e3',
          '400': '#8692d4',
          '500': '#6971c8',
          '600': '#5658ba',
          '700': '#4c49a6',
          '800': '#46428b',
          '900': '#393870',
          '950': '#282645',
      },
      secondary: {
          '50': '#f8f7ed',
          '100': '#efeed8',
          '200': '#e1e0b5',
          '300': '#cdcd89',
          '400': '#b7b863',
          '500': '#a3a649',
          '600': '#787c34',
          '700': '#5c602b',
          '800': '#4a4d27',
          '900': '#404324',
          '950': '#212310',
      },
      accent: {
          '50': '#f2f4fb',
          '100': '#e7ebf8',
          '200': '#d4dbf1',
          '300': '#bac3e7',
          '400': '#9ea4db',
          '500': '#8589cf',
          '600': '#6966bc',
          '700': '#5f5ba7',
          '800': '#4e4c87',
          '900': '#43426d',
          '950': '#27273f',
      },
      gray: {
          '50': '#f6f7f9',
          '100': '#eceef2',
          '200': '#d6d9e1',
          '300': '#b2b8c7',
          '400': '#8892a8',
          '500': '#69748e',
          '600': '#545e75',
          '700': '#454c5f',
          '800': '#3b4151',
          '900': '#30343f',
          '950': '#23262e',
      },
      danger: {
          '50': "#fef2f2",
          '100': "#fee2e2",
          '200': "#fecaca",
          '300': "#fca5a5",
          '400': "#f87171",
          '500': "#ef4444",
          '600': "#dc2626",
          '700': "#b91c1c",
          '800': "#991b1b",
          '900': "#7f1d1d",
          '950': "#450a0a",
      },
      warning: {
          '50': "#fefce8",
          '100': "#fef9c3",
          '200': "#fef08a",
          '300': "#fde047",
          '400': "#facc15",
          '500': "#eab308",
          '600': "#ca8a04",
          '700': "#a16207",
          '800': "#854d0e",
          '900': "#713f12",
          '950': "#422006",
      },
      success: {
          '50': "#f0fdf4",
          '100': "#dcfce7",
          '200': "#bbf7d0",
          '300': "#86efac",
          '400': "#4ade80",
          '500': "#22c55e",
          '600': "#16a34a",
          '700': "#15803d",
          '800': "#166534",
          '900': "#14532d",
          '950': "#052e16",
      },
      info: {
          '50': "#eff6ff",
          '100': "#dbeafe",
          '200': "#bfdbfe",
          '300': "#93c5fd",
          '400': "#60a5fa",
          '500': "#3b82f6",
          '600': "#2563eb",
          '700': "#1d4ed8",
          '800': "#1e40af",
          '900': "#1e3a8a",
          '950': "#172554",
      },
      },
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
    animations,
    nextui()
  ],

};
export default config;
