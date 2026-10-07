/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 使用 rgb 通道 + <alpha-value>，Tailwind 才能產生 bg-aurora-blue/40 這類透明度修飾詞
      // 通道數值定義於 src/index.css 的 :root（--rgb-*），需與 --color-* hex 值保持一致
      colors: {
        'bg-core': 'rgb(var(--rgb-bg-core) / <alpha-value>)',
        'bg-mist': 'rgb(var(--rgb-bg-mist) / <alpha-value>)',
        'bg-shadow': 'rgb(var(--rgb-bg-shadow) / <alpha-value>)',
        'aurora-blue': 'rgb(var(--rgb-accent) / <alpha-value>)',
        'soft-magenta': 'rgb(var(--rgb-soft-magenta) / <alpha-value>)',
        'dawn-gold': 'rgb(var(--rgb-dawn-gold) / <alpha-value>)',
        'prism-green': 'rgb(var(--rgb-prism-green) / <alpha-value>)',
        'title-white': 'rgb(var(--rgb-title-white) / <alpha-value>)',
        'info-gold-gray': 'rgb(var(--rgb-info-gold-gray) / <alpha-value>)',
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
}
