import './globals.css';

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
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
