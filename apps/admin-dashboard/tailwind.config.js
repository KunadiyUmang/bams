/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#142B4A',
          dark: '#0A1829',
          light: '#1E3E6B',
          50: '#F0F5FA',
          100: '#E1EBF5',
          200: '#C2D7EC',
          300: '#94BBE0',
          400: '#5C98CE',
          500: '#2F74B5',
          600: '#1F5A96',
          700: '#142B4A',
          800: '#0F2137',
          900: '#0A1829',
        },
        secondary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
          dark: '#15803D',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        sidebar: {
          DEFAULT: '#0F2137',
          dark: '#070C14',
          hover: '#193456',
          active: '#1E3E6B',
        },
        bgLight: '#F1F5F9',
        darkBg: '#0A0F1E',
        darkSidebar: '#070C14',
        darkCard: '#111827',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        gujarati: ['var(--font-noto-gujarati)', 'Noto Sans Gujarati', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        sidebar: '2px 0 12px 0 rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
