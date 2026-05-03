import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#4F46E5',
          purple: '#7C3AED',
          dark: '#0F172A',
          card: '#FFFFFF',
          light: '#F8FAFC',
          accent: '#818CF8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
