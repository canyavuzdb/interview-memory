import './globals.css';

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      document.documentElement.dataset.theme =
        savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemTheme;
    } catch {
      document.documentElement.dataset.theme = 'light';
    }
  })();
`;

const localeScript = `
  (() => {
    const locale = window.location.pathname.split('/')[1];
    document.documentElement.lang = locale === 'en' ? 'en' : 'tr';
  })();
`;

export const metadata = {
  title: {
    default: 'Interview Memory',
    template: '%s | Interview Memory',
  },
  description:
    'Adayların anonim başvuru ve mülakat deneyimlerini topluluk verisine dönüştüren platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
