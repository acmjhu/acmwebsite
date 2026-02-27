import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#001d3d",
          dark: "#000814",
          mid: "#003566",
          light: "#e8f0fe",
        },
        success: "#10b981",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
