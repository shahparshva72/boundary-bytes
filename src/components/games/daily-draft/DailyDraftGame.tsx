'use client';

import { useMemo } from 'react';
import DailyDraftBoard from '@/components/games/daily-draft/DailyDraftBoard';
import DailyDraftResult from '@/components/games/daily-draft/DailyDraftResult';
import { Spinner } from '@/components/ui';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useDailyCountdownLabel } from '@/hooks/useDailyCountdownLabel';
import { useDailyGameProgress } from '@/hooks/useDailyGameProgress';
import { useDraftLeaderboard } from '@/hooks/useDraftLeaderboard';
import { useGamePool } from '@/hooks/useGamePool';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';
import { buildDailyDraftPool } from '@/lib/games/dailyDraft';
import { getLocalDateISO } from '@/lib/games/seededRandom';

export default function DailyDraftGame() {
  const { selectedLeague } = useLeagueContext();
  const { fetchWithLeague } = useLeagueAPI();
  const { pool, isLoading, isError } = useGamePool();

  const today = getLocalDateISO();
  const countdownLabel = useDailyCountdownLabel();
  const { progress, streak, isCompletedToday, sessionKey } = useDailyGameProgress(
    'draft',
    today,
    selectedLeague,
  );
  const { data: leaderboard } = useDraftLeaderboard(today, isCompletedToday);

  const draftPool = useMemo(() => {
    if (!pool || !selectedLeague) {
      return null;
    }
    return buildDailyDraftPool({ pool, league: selectedLeague, date: today });
  }, [pool, selectedLeague, today]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-black">Loading today&apos;s draft pool...</p>
      </div>
    );
  }

  if (isError || !pool || !draftPool || !selectedLeague) {
    return (
      <p className="text-center font-bold text-[#FF5E5B] py-4">
        Could not load player data for Daily Draft.
      </p>
    );
  }

  if (isCompletedToday && progress) {
    return (
      <DailyDraftResult
        draftProgress={progress}
        draftStreak={streak}
        countdownLabel={countdownLabel}
        selectedLeague={selectedLeague}
        leaderboard={leaderboard}
      />
    );
  }

  return (
    <DailyDraftBoard
      key={sessionKey}
      draftPool={draftPool}
      today={today}
      selectedLeague={selectedLeague}
      draftStreak={streak}
      fetchWithLeague={fetchWithLeague}
    />
  );
}
