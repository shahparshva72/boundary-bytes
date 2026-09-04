'use client';

import dynamic from 'next/dynamic';
import { Tab, Tabs } from './ui/Tabs';

const TabLoading = () => (
  <div className="flex min-h-32 items-center justify-center p-6 text-sm font-bold text-black">
    Loading stats...
  </div>
);

const MatchupTab = dynamic(() => import('@/components/MatchupTab'), { loading: TabLoading });
const MultiMatchupTab = dynamic(() => import('@/components/MultiMatchupTab'), {
  loading: TabLoading,
});
const PlayerCompare = dynamic(() => import('@/components/PlayerCompare'), { loading: TabLoading });
const RunScorers = dynamic(() => import('@/components/RunScorers'), { loading: TabLoading });
const WicketTakers = dynamic(() => import('@/components/WicketTakers'), { loading: TabLoading });
const TeamWins = dynamic(() => import('@/components/TeamWins'), { loading: TabLoading });
const BowlingWicketTypes = dynamic(() => import('@/components/BowlingWicketTypes'), {
  loading: TabLoading,
});
const TeamAverages = dynamic(() => import('@/components/TeamAverages'), { loading: TabLoading });
const TeamRunRateTab = dynamic(() => import('@/components/TeamRunRateTab'), {
  loading: TabLoading,
});

export default function StatsTabs() {
  return (
    <Tabs>
      <Tab label="Batter vs Bowler">
        <MatchupTab />
      </Tab>
      <Tab label="Multi Matchup">
        <MultiMatchupTab />
      </Tab>
      <Tab label="Compare Players">
        <PlayerCompare />
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
      <Tab label="Bowling Wicket Types">
        <BowlingWicketTypes />
      </Tab>
      <Tab label="Team Averages">
        <TeamAverages />
      </Tab>
      <Tab label="Team Run Rate">
        <TeamRunRateTab />
      </Tab>
    </Tabs>
  );
}
