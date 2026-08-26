import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Footer from '../components/Footer';
import './globals.css';
import { Providers } from './providers';

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'Boundary Bytes | Cricket Stats Query Platform',
  description:
    'Discover comprehensive cricket statistics with Boundary Bytes. Access WPL and IPL match scores, player stats, and get detailed insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetBrainsMono.variable}>
      <body className={jetBrainsMono.className}>
        <Providers>{children}</Providers>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
