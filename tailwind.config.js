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
        'bg-mist': 'rgb(var(--rgb-bg-mist) / <alpha-value>)',
        'bg-shadow': 'rgb(var(--rgb-bg-shadow) / <alpha-value>)',
        'dawn-gold': 'rgb(var(--rgb-highlight) / <alpha-value>)',
        'spectral-crimson': 'rgb(var(--rgb-accent) / <alpha-value>)',
        'spectral-magenta': 'rgb(var(--rgb-magenta) / <alpha-value>)',
        'spectral-cyan': 'rgb(var(--rgb-cyan) / <alpha-value>)',
        'title-white': 'rgb(var(--rgb-title-white) / <alpha-value>)',
        'info-gold-gray': 'rgb(var(--rgb-info-gold-gray) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Montserrat"', '"Noto Sans TC"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans TC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'emil-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'emil-smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        'instant': '150ms',
        'feedback': '200ms',
        'layout': '280ms',
      },
    },
  },
  plugins: [],
};
