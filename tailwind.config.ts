import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#11100f",
        paper: "#f5f1eb",
        ember: "#ff6a2a",
        muted: "#aaa39b",
      },
    },
  },
  plugins: [],
};

export default config;
