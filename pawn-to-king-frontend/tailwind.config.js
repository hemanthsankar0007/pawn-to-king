/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f19",
        card: "#111827",
        gold: "#d4af37",
        "gold-hover": "#f5d76e",
        text: "#f3f4f6"
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        gold: "0 0 30px rgba(212, 175, 55, 0.35)"
      }
    }
  },
  plugins: []
};

