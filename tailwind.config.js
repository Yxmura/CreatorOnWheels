/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./build/*.html",
    "./build/*.js",                    // Scan your HTML files for Tailwind classes
  ],
  plugins: [
    require("tailwindcss-motion"),
  ],
  theme: {
    extend: {
      colors: {
        'white': '#ffffff',
        'purple': '#3f3cbb',
        'midnight': '#121063',
        'metal': '#565584',
        'tahiti': '#3ab7bf',
        'silver': '#ecebff',
        'bubble-gum': '#ff77e9',
        'bermuda': '#78dcca',
        'primary': '#F9FAFB',
        'secondary': '#514AE6',
        'black': '#1F2937',
        'accent': '#1F2937',
        'left': "#6062EF",
        'right': "#534DE7",
      },
    },
  },
  darkMode: ['class'],  // Enables dark mode using a class
};