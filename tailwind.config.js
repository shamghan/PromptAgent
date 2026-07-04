/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      boxShadow: {
        'glass': '0 4px 24px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.03)',
        'float': '0 15px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
        'btn': '0 2px 4px -1px rgba(99,102,241,0.15), 0 1px 2px -1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
        'btn-hover': '0 4px 8px -1px rgba(99,102,241,0.2), 0 2px 4px -1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        'card': '0 1px 3px -1px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 1.5s linear infinite',
        'float': 'float 5s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
