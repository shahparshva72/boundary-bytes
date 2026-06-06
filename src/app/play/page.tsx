'use client';

import Layout from '@/app/stats/components/Layout';
import DailyChallengeGame from '@/components/games/daily-challenge/DailyChallengeGame';
import MatchupShowdownGame from '@/components/games/matchup-showdown/MatchupShowdownGame';
import { PlayTab, PlayTabs } from '@/components/games/PlayTabs';
import StatGuesserGame from '@/components/games/stat-guesser/StatGuesserGame';
import { useLeagueContext } from '@/contexts/LeagueContext';

export const dynamic = 'force-dynamic';

export default function PlayPage() {
  const { selectedLeague } = useLeagueContext();

  return (
    <Layout
      title="Play"
      description="Test your cricket knowledge with real stats"
      showLatestMatchDate={false}
    >
      {!selectedLeague ? (
        <p className="text-center font-bold text-black py-4">Select a league to start playing.</p>
      ) : (
        <PlayTabs>
          <PlayTab id="stat-guesser">
            <StatGuesserGame />
          </PlayTab>
          <PlayTab id="matchup">
            <MatchupShowdownGame />
          </PlayTab>
          <PlayTab id="daily">
            <DailyChallengeGame />
          </PlayTab>
        </PlayTabs>
      )}
    </Layout>
  );
}
