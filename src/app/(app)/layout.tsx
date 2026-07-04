import AppWithLeagueSelection from '@/components/AppWithLeagueSelection';
import Header from '@/components/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWithLeagueSelection>
      <Header />
      {children}
    </AppWithLeagueSelection>
  );
}
