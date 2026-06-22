/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-core': 'var(--color-bg-core)',
        'bg-mist': 'var(--color-bg-mist)',
        'bg-shadow': 'var(--color-bg-shadow)',
        'aurora-blue': 'var(--color-aurora-blue)',
        'soft-magenta': 'var(--color-soft-magenta)',
        'dawn-gold': 'var(--color-dawn-gold)',
        'prism-green': 'var(--color-prism-green)',
        'title-white': 'var(--color-title-white)',
        'info-gold-gray': 'var(--color-info-gold-gray)',
      },
      fontFamily: {
        sans: ['"Space Mono"', '"Noto Sans TC"', 'monospace', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      fontSize: {
        '3xl': '32px', // Heading 1
        '2xl': '24px', // Heading 2
        'xl': '20px',  // Heading 3
        'base': '16px', // Body Text
      },
    },
  },
  plugins: [],
}
