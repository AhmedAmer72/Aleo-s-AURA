/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          // New authentic palette - teal/emerald trust colors + warm accents
          primary: '#14b8a6',      // Teal-500 - trust, verification
          secondary: '#06b6d4',    // Cyan-500
          accent: '#f59e0b',       // Amber-500 - value, warmth
          dark: '#0c1222',         // Rich navy-black
          darker: '#060a12',       // Deeper
          light: '#1e293b',        // Slate-800
          glow: '#2dd4bf',         // Teal-400 glow
          success: '#10b981',      // Emerald-500
          warning: '#f59e0b',
          danger: '#ef4444',
          gold: '#fbbf24',
          silver: '#94a3b8',       // Slate-400
          bronze: '#cd7f32',
          // Tier-specific
          tierGold: '#fbbf24',
          tierSilver: '#94a3b8',
          tierBronze: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient': 'gradient 12s ease infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(20, 184, 166, 0.6), 0 0 60px rgba(20, 184, 166, 0.3)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
