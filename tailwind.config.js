/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        dm: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        'deep-black': '#080808',
        'surface-black': '#111111',
        'off-white': '#F4F3F0',
        'conflagrator-red': '#E3000F',
        'teal': '#00897B',
        'muted-grey': '#6B6B6B',
      },
      screens: {
        xs: '390px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
