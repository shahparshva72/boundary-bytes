import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import DeferredAnalytics from '../components/DeferredAnalytics';
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
    "Discover comprehensive cricket statistics with Boundary Bytes. Match scores, player stats and insights from T20 franchise and domestic leagues around the world, men's and women's.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetBrainsMono.variable}>
      <body className={jetBrainsMono.className}>
        <Providers>{children}</Providers>
        <Footer />
        <DeferredAnalytics />
      </body>
    </html>
  );
}
