/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        sm: '700px',
        md: '850px',
        lg: '1130px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
