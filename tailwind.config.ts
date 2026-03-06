import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lv: {
          bg: "#0B0B0C",
          panel: "#141416",
          panelMuted: "#1D1D21",
          border: "rgba(230, 230, 230, 0.16)",
          neon: "#FFC107",
          neonSoft: "#FFB300",
          text: "#FFFFFF",
          textMuted: "#C7C7C2",
          textDark: "#111111",
          neutralSoft: "#F5F5F2",
        },
      },
      boxShadow: {
        neon: "0 10px 30px rgba(0,0,0,0.25)",
      },
      backgroundImage: {
        "lv-surface":
          "radial-gradient(circle at 20% 0%, rgba(255, 193, 7, 0.14), transparent 30%), linear-gradient(180deg, #141416 0%, #0B0B0C 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
