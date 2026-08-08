import AppLayoutContent from '@/components/AppLayoutContent';
import AppWithLeagueSelection from '@/components/AppWithLeagueSelection';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWithLeagueSelection>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AppWithLeagueSelection>
  );
}
