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
        canvas: '#F7F4EF',
        surface: '#FFFCF7',
        surfaceMuted: '#F1EDE6',
        ink: '#191714',
        muted: '#706A61',
        line: '#E2DDD4',
        accent: '#5B6F64',
        accentDark: '#31443A',
        warning: '#9A6B2F',
        danger: '#9B4A45',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(25, 23, 20, 0.08)',
        card: '0 10px 30px rgba(25, 23, 20, 0.06)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
