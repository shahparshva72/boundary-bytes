'use client';

import BowlingWicketTypes from '@/components/BowlingWicketTypes';
import MatchupTab from '@/components/MatchupTab';
import RunScorers from '@/components/RunScorers';
import TeamAverages from '@/components/TeamAverages';
import TeamWins from '@/components/TeamWins';
import WicketTakers from '@/components/WicketTakers';
import { Tab, Tabs } from './ui/Tabs';

export default function StatsTabs() {
  return (
    <Tabs>
      <Tab label="Batter vs Bowler">
        <MatchupTab />
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
