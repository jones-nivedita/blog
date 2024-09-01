/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lavender': '#C39BD3',
        'dark-lavender': '#AF7AC5 ',
        'pearl': '#ecdbc9',
        'dark-pearl': '#e5d3c0'
      }
    },
  },
  plugins: [
  ],
}

