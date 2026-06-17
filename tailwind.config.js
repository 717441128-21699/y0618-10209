/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');

const safeColors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'indigo', 'emerald', 'amber', 'red', 'orange', 'yellow', 'lime', 'green', 'teal', 'cyan', 'sky', 'blue', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const safeLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const colorVariants = ['bg', 'text', 'border', 'from', 'via', 'to', 'ring', 'divide', 'shadow', 'accent', 'caret', 'fill', 'stroke', 'placeholder', 'outline'];
const safelistPatterns = [];
safeColors.forEach((c) => {
  safeLevels.forEach((l) => {
    colorVariants.forEach((v) => {
      safelistPatterns.push(`${v}-${c}-${l}`);
    });
    safelistPatterns.push(`hover:bg-${c}-${l}`);
    safelistPatterns.push(`hover:text-${c}-${l}`);
    safelistPatterns.push(`hover:border-${c}-${l}`);
    safelistPatterns.push(`active:bg-${c}-${l}`);
    safelistPatterns.push(`focus:ring-${c}-${l}`);
    safelistPatterns.push(`focus:border-${c}-${l}`);
    safelistPatterns.push(`focus-visible:ring-${c}-${l}`);
    safelistPatterns.push(`dark:bg-${c}-${l}`);
    safelistPatterns.push(`dark:text-${c}-${l}`);
    safelistPatterns.push(`dark:border-${c}-${l}`);
  });
});

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        indigo: {
          ...colors.indigo,
          900: '#1E3A8A',
        },
        emerald: {
          ...colors.emerald,
          600: '#059669',
        },
        amber: {
          ...colors.amber,
          600: '#D97706',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Sans SC"', 'serif'],
        sans: ['Inter', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-stagger': 'fade-in 0.5s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float-up': 'float-up 0.6s ease-out forwards',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  safelist: safelistPatterns,
  plugins: [],
};
