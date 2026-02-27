import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003366",
          mid: "#0055a5",
          light: "#e8f0fe",
        },
        success: "#10b981",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
