/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#132E32",     // Verde lima (texto principal)
        secondary: "#FFD015",   // Dorado (iconos inactivos)
        accent: "#132E32",      // Verde petróleo (header)
        background: "#6EBFDB",  // Azul cielo (fondo general)
        surface: "#5ab8d3",     // Cards y drawer
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        "poppins-medium": ["Poppins-Medium", "sans-serif"],
        "poppins-semibold": ["Poppins-SemiBold", "sans-serif"],
        "poppins-bold": ["Poppins-Bold", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [],
};