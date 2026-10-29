'use client';

import nextDynamic from 'next/dynamic';
import Layout from '@/app/(app)/stats/components/Layout';
import { PlayTab, PlayTabs } from '@/components/games/PlayTabs';

export const dynamic = 'force-dynamic';

const GameLoading = () => (
  <div className="flex min-h-48 items-center justify-center p-6 text-sm font-bold text-black">
    Loading game...
  </div>
);

const DailyChallengeGame = nextDynamic(
  () => import('@/components/games/daily-challenge/DailyChallengeGame'),
  { loading: GameLoading },
);
const MatchupShowdownGame = nextDynamic(
  () => import('@/components/games/matchup-showdown/MatchupShowdownGame'),
  { loading: GameLoading },
);
const StatGuesserGame = nextDynamic(
  () => import('@/components/games/stat-guesser/StatGuesserGame'),
  { loading: GameLoading },
);

export default function PlayPage() {
  return (
    <Layout
      title="Play"
      description="Test your cricket knowledge with real stats"
      showLatestMatchDate={false}
    >
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
    </Layout>
  );
}
