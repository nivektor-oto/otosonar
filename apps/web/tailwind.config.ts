import type { Config } from "tailwindcss";

/**
 * OtoSonar — Light tema (Arabam / Sahibinden seviyesinde sade).
 *
 * Tasarım notları:
 *  - Zemin `#FAFBFC` (neredeyse beyaz), panel `#FFFFFF`
 *  - Metin default `#1A1F2E` (slate-900 benzeri)
 *  - Accent (CTA) `#F59E0B` (amber-500) — Sahibinden sarı / Arabam turuncu arası ılımlı
 *  - Accent2 (brand detay) `#10B981` (emerald-500) — OtoSonar marka vurgusu
 *  - Border `#E2E8F0` (slate-200)
 *  - Legacy token isimleri korundu (bg, panel, border, accent, accent2); sadece renkler light'a alındı.
 *    Böylece mevcut `bg-bg`, `bg-panel`, `border-border`, `text-accent` vs. toplu dönmüş oluyor.
 */
const config: Config = {
  darkMode: "media",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAFBFC",
        panel: "#FFFFFF",
        border: "#E2E8F0",
        accent: "#F59E0B",
        accent2: "#10B981",
        success: "#10b981",
        warn: "#F59E0B",
        danger: "#ef4444",
        muted: "#64748B",
        ink: "#1A1F2E",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
