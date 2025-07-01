'use client';

import { Tabs, Tab } from './tabs';
import MatchupTab from '@/components/MatchupTab';
import RunScorers from '@/components/RunScorers';
import WicketTakers from '@/components/WicketTakers';

interface RunScorerData {
  player: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
  matches: number;
}

interface WicketTakerData {
  player: string;
  wickets: number;
  ballsBowled: number;
  economy: number;
  matches: number;
}

interface StatsTabsProps {
  batters: string[];
  bowlers: string[];
  runScorers: RunScorerData[];
  wicketTakers: WicketTakerData[];
}

export default function StatsTabs({ batters, bowlers, runScorers, wicketTakers }: StatsTabsProps) {
  return (
    <Tabs>
      <Tab label="Batter vs Bowler">
        <MatchupTab batters={batters} bowlers={bowlers} />
      </Tab>
      <Tab label="Run Scorers">
        <RunScorers data={runScorers} />
      </Tab>
      <Tab label="Wicket Takers">
        <WicketTakers data={wicketTakers} />
      </Tab>
    </Tabs>
  );
}
