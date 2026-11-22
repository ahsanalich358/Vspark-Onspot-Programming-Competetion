/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      }
    },
  },
  plugins: [],
}
