import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: 'variable',
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-plex-mono',
  display: 'swap',
});

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
    'Adayların başvuru ve mülakat deneyimlerini anonim, karşılaştırılabilir işe alım verilerine dönüştüren platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body className={`${plexSans.variable} ${plexMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
