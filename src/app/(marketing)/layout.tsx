import AppLayoutContent from '@/components/AppLayoutContent';
import AppWithLeagueSelection from '@/components/AppWithLeagueSelection';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWithLeagueSelection>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AppWithLeagueSelection>
  );
}
