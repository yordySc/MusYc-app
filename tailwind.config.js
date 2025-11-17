/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'primary': '#5bbf96',
        'secondary': '#91b8d2',
        'accent': '#a8b5c9',

        'background-light': '#f4f4f5',
        'text-light': '#18181b',
        'card-light': '#ffffff',
        'border-light': '#e5e5e5',

        'background-dark': '#1e293b', 
        'text-dark': '#f4f4f5',
        'card-dark': '#334155', 
        'border-dark': '#475569',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}