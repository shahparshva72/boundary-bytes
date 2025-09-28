'use client';

import { Tabs, Tab } from './tabs';
import MatchupTab from '@/components/MatchupTab';
import RunScorers from '@/components/RunScorers';
import WicketTakers from '@/components/WicketTakers';
import TeamWins from '@/components/TeamWins';
import BowlingWicketTypes from '@/components/BowlingWicketTypes';
import TeamAverages from '@/components/TeamAverages';

interface StatsTabsProps {
  batters: string[];
  bowlers: string[];
}

export default function StatsTabs({ batters, bowlers }: StatsTabsProps) {
  return (
    <Tabs defaultTab="Batter vs Bowler">
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
      <Tab label="Bowling Wicket Types">
        <BowlingWicketTypes />
      </Tab>
      <Tab label="Team Averages">
        <TeamAverages />
      </Tab>
    </Tabs>
  );
}
