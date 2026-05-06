import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#3B3735',
        cream: '#D8D1BF',
        'dusty-pink': '#D8B7B3',
        'soft-blue': '#B7C8CF',
        'off-white': '#F4F0E8',
        'muted-text': '#2F2F2F',
        'warm-brown': '#8B7355',
        'light-cream': '#EDE8DC',
        'folder-shadow': '#C4BAA6',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'folder': '0 4px 20px rgba(59, 55, 53, 0.15)',
        'folder-hover': '0 8px 32px rgba(59, 55, 53, 0.22)',
        'paper': '2px 4px 12px rgba(59, 55, 53, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
