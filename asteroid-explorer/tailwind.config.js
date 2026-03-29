/** @type {import('tailwindcss').Config} */
export default {
  content:[
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#030712', // Deep space black
          800: '#0B1120',
          700: '#111827',
          accent: '#38bdf8', // Neon blue
          danger: '#ef4444'  // Red for impact
        }
      },
      fontFamily: {
        sans: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins:[],
}
