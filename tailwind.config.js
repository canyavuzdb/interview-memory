/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './data/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        surfaceMuted: 'var(--surface-muted)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        accentDark: 'var(--accent-dark)',
        warning: '#9A6B2F',
        danger: '#9B4A45',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
      },
      fontFamily: {
        sans: [
          'var(--font-plex-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          'var(--font-plex-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
