/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grok: {
          bg: '#000000',
          surface: '#202020',
          'surface-hover': '#2A2A2A',
          'surface-active': '#303030',
          border: '#333333',
          white: '#FFFFFF',
          muted: '#8B8B8B',
          dim: '#6B6B6B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
