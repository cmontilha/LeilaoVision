import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lv: {
          bg: "#030712",
          panel: "#0b1220",
          panelMuted: "#111d34",
          border: "#1c2f4f",
          neon: "#37b7ff",
          neonSoft: "#7fd7ff",
          text: "#e6f1ff",
          textMuted: "#8da5c8",
        },
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(55,183,255,.25), 0 15px 45px rgba(30,95,180,.25)",
      },
      backgroundImage: {
        "lv-grid":
          "linear-gradient(rgba(127, 215, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(127, 215, 255, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
