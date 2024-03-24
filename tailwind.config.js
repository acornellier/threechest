/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        sm: '600px',
        md: '810px',
        lg: '1130px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
