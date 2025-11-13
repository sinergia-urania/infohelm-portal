// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  // ⬅️ VAŽNO: omogućava .dark klasu na <html>
  darkMode: "class",

  // (može da ostane — v4 ga ignoriše, ali ne smeta)
  content: ["./src/**/*.{ts,tsx,mdx}"],

  theme: { extend: {} },
  plugins: []
} satisfies Config;
