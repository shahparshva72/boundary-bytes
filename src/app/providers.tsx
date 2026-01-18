'use client';

import { LeagueProvider } from '@/contexts/LeagueContext';
import QueryProvider from '@/providers/QueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LeagueProvider>{children}</LeagueProvider>
    </QueryProvider>
  );
}
