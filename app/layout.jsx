import './globals.css';

export const metadata = {
  title: 'Mülakat Atlası',
  description: 'Adayların anonim mülakat deneyimleriyle işe alım süreçlerini görünür kılan platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
