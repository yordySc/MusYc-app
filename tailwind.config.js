/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light Mode
        "bg-light": "#F5F7FA",
        "bg-card-light": "#FFFFFF",
        "text-light": "#132E32",
        "text-secondary-light": "#6B7280",
        "border-light": "#E5E7EB",
        
        // Dark Mode
        "bg-dark": "#0D1B1F",
        "bg-card-dark": "#1A2E33",
        "text-dark": "#F0F9FF",
        "text-secondary-dark": "#D1D5DB",
        "border-dark": "#374151",
        
        // Brand Colors
        primary: "#132E32",
        secondary: "#84FFC6",
        accent: "#FFD015",
        "accent-dark": "#FDB022",
        danger: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
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