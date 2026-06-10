import './globals.css';

export const metadata = {
  title: 'Monikos Jaunikio Atranka',
  description: 'Mergvakario balsavimo žaidimas'
};

export default function RootLayout({ children }) {
  return (
    <html lang="lt">
      <body>{children}</body>
    </html>
  );
}
