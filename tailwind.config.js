/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        stadium: {
          dark: '#0B0F19',
          card: '#131B2E',
          border: '#1E293B',
          glow: '#1E3A8A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Impact', 'Teko', 'Oswald', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'gavel-strike': 'gavelStrike 0.3s ease-in-out',
        'badge-pop': 'badgePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(234, 179, 8, 0.8)' }
        },
        gavelStrike: {
          '0%': { transform: 'rotate(-25deg)' },
          '50%': { transform: 'rotate(15deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        badgePop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
