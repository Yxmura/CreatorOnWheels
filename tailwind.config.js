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
        "primary": {
          "50": "#f6f6fe",
          "100": "#eae9fc",
          "200": "#d4d2f9",
          "300": "#b2aef4",
          "400": "#645de9",
          "500": "#251cce",
          "600": "#1b1494",
          "700": "#130f6c",
          "800": "#0b093f",
          "900": "#06041f",
          "950": "#030212"
        },
        "secondary": {
          "50": "#f8fafb",
          "100": "#eff2f6",
          "200": "#dee4ed",
          "300": "#c4cfde",
          "400": "#899fbd",
          "500": "#547096",
          "600": "#3d506c",
          "700": "#2c3a4e",
          "800": "#1a222e",
          "900": "#0d1117",
          "950": "#070a0d"
        },
        "tertiary": {
          "50": "#f6f6fe",
          "100": "#e9e9fb",
          "200": "#d4d3f8",
          "300": "#b1b0f2",
          "400": "#6361e5",
          "500": "#2421ca",
          "600": "#1a1891",
          "700": "#131169",
          "800": "#0b0a3d",
          "900": "#05051f",
          "950": "#030312"
        },
        "quaternary": {
          "50": "#f7f7fd",
          "100": "#ececf9",
          "200": "#d9d8f3",
          "300": "#babae9",
          "400": "#7674d2",
          "500": "#3b39b1",
          "600": "#2b297f",
          "700": "#1f1e5c",
          "800": "#121136",
          "900": "#09091b",
          "950": "#05050f"
        },
        "quinary": {
          "50": "#f9fafb",
          "100": "#f0f2f5",
          "200": "#e0e6eb",
          "300": "#c8d1da",
          "400": "#91a3b6",
          "500": "#5e758d",
          "600": "#435465",
          "700": "#313d49",
          "800": "#1d242b",
          "900": "#0e1215",
          "950": "#080a0c"
        },
        'white': '#ffffff',
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