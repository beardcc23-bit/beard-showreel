/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-core': 'rgb(var(--rgb-bg-core) / <alpha-value>)',
        'dawn-gold': 'rgb(var(--rgb-highlight) / <alpha-value>)',
        'spectral-crimson': 'rgb(var(--rgb-accent) / <alpha-value>)',
        'spectral-magenta': 'rgb(var(--rgb-magenta) / <alpha-value>)',
        'spectral-cyan': 'rgb(var(--rgb-cyan) / <alpha-value>)',
        'title-white': 'rgb(var(--rgb-title-white) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Montserrat"', '"Noto Sans TC"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans TC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
