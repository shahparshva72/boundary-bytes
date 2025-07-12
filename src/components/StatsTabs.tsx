'use client';

import { Tabs, Tab } from './tabs';
import MatchupTab from '@/components/MatchupTab';
import RunScorers from '@/components/RunScorers';
import WicketTakers from '@/components/WicketTakers';
import TeamWins from '@/components/TeamWins';

interface StatsTabsProps {
  batters: string[];
  bowlers: string[];
}

export default function StatsTabs({ batters, bowlers }: StatsTabsProps) {
  return (
    <Tabs>
      <Tab label="Batter vs Bowler">
        <MatchupTab batters={batters} bowlers={bowlers} />
      </Tab>
      <Tab label="Run Scorers">
        <RunScorers />
      </Tab>
      <Tab label="Wicket Takers">
        <WicketTakers />
      </Tab>
      <Tab label="Team Wins">
        <TeamWins />
      </Tab>
    </Tabs>
  );
}
