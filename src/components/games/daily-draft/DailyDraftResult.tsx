'use client';

import { useState } from 'react';
import GameResultPanel from '@/components/games/shared/GameResultPanel';
import type { DailyDraftProgress } from '@/lib/games/dailyDraft/types';
import { copyToClipboard, formatDailyDraftShareText } from '@/lib/games/shareText';
import type { DraftLeaderboardResponse } from '@/services/gamesService';
import type { League } from '@/types/league';

interface DailyDraftResultProps {
  draftProgress: DailyDraftProgress;
  draftStreak: number;
  countdownLabel: string;
  selectedLeague: League;
  leaderboard: DraftLeaderboardResponse | undefined;
}

export default function DailyDraftResult({
  draftProgress,
  draftStreak,
  countdownLabel,
  selectedLeague,
  leaderboard,
}: DailyDraftResultProps) {
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleShare = async () => {
    const text = formatDailyDraftShareText(
      selectedLeague,
      draftProgress.score,
      draftProgress.optimalScore,
      draftProgress.efficiencyPct,
      draftStreak,
    );
    const ok = await copyToClipboard(text);
    setShareStatus(ok ? 'Copied!' : 'Copy failed');
    setTimeout(() => setShareStatus(null), 2000);
  };

  const filled = Math.min(5, Math.round(draftProgress.efficiencyPct / 20));
  const squares = Array.from({ length: 5 }, (_, i) => (i < filled ? '🟩' : '⬜')).join('');

  return (
    <GameResultPanel
      title="Draft locked in"
      subtitle={`${draftProgress.score} pts · ${draftProgress.efficiencyPct}% of optimal · Streak: ${draftStreak} · Next in ${countdownLabel}`}
      onShare={handleShare}
      shareLabel={shareStatus ?? 'Share result'}
      showPlayAgain={false}
    >
      <p className="text-2xl tracking-widest">{squares}</p>
      <p className="text-sm font-bold text-black text-center">
        Optimal lineup: {draftProgress.optimalScore} pts
      </p>
      {leaderboard && (
        <div className="w-full mt-2 border-2 border-black p-3 bg-[#FFED66]">
          <p className="text-sm font-black uppercase text-black mb-2">Today&apos;s leaderboard</p>
          {leaderboard.yourRank != null && (
            <p className="text-xs font-bold text-black mb-2">
              Your rank: #{leaderboard.yourRank} of {leaderboard.totalPlayers}
            </p>
          )}
          <ul className="space-y-1">
            {leaderboard.topScores.map((entry) => (
              <li
                key={entry.rank}
                className={`text-xs font-bold flex justify-between ${entry.isYou ? 'text-[#FF5E5B]' : 'text-black'}`}
              >
                <span>
                  #{entry.rank}
                  {entry.isYou ? ' (you)' : ''}
                </span>
                <span>{entry.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs font-bold text-black/60">Come back tomorrow for a new brief.</p>
    </GameResultPanel>
  );
}
