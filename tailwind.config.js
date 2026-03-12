/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#060810',
          900: '#0b0f1a',
          800: '#111827',
          700: '#1a2236',
          600: '#243049',
        },
        ember: {
          DEFAULT: '#f97316',
          50:  '#fff7ed',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6810',
        },
        jade: {
          DEFAULT: '#10b981',
          400: '#34d399',
          500: '#10b981',
        },
        cobalt: {
          DEFAULT: '#6366f1',
          400: '#818cf8',
          500: '#6366f1',
        },
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-up': 'fadeUp 0.4s ease forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'think-spin': 'thinkSpin 1.2s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px 4px rgba(249,115,22,0.15)' },
          '50%': { boxShadow: '0 0 35px 8px rgba(249,115,22,0.3)' },
        },
        scan: {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        thinkSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'grid-ink': `linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)`,
      },
    },
  },
  plugins: [],
}
