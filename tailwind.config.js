/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#EBF1F8',
          100: '#EBF1F8',
          200: '#1b44fe33',
          300: '#1b44fe66',
          400: '#1b44fe99',
          500: '#1b44fe',
          600: '#1538d4',
          700: '#1538d4',
          800: '#0f2ba8',
        },
      },
      backgroundImage: {
        'primary-gradient': 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)',
      },
    },
  },
  plugins: [],
}
