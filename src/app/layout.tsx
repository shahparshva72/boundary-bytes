import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from '../components/Header';
import AppWithLeagueSelection from '../components/AppWithLeagueSelection';
import Footer from '../components/Footer';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <AppWithLeagueSelection>
            <Header />
            {children}
          </AppWithLeagueSelection>
        </Providers>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
