'use client';

import QueryProvider from '@/providers/QueryProvider';
import { LeagueProvider } from '@/contexts/LeagueContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LeagueProvider>
      <QueryProvider>{children}</QueryProvider>
    </LeagueProvider>
  );
}
