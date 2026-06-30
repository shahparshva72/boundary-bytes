'use client';

import { useEffect, useMemo, useState } from 'react';
import DraftPlayerTile from '@/components/games/daily-draft/DraftPlayerTile';
import GameResultPanel from '@/components/games/shared/GameResultPanel';
import GameScoreBar from '@/components/games/shared/GameScoreBar';
import { Button, Spinner } from '@/components/ui';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useGamePool } from '@/hooks/useGamePool';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';
import {
  buildDailyDraftPool,
  efficiencyPct,
  lineupCost,
  scoreLineup,
} from '@/lib/games/dailyDraft';
import { getDeviceId } from '@/lib/games/deviceId';
import { getLocalDateISO, getMsUntilNextLocalDay } from '@/lib/games/seededRandom';
import { copyToClipboard, formatDailyDraftShareText } from '@/lib/games/shareText';
import {
  fetchDraftLeaderboard,
  submitDraftScore,
  type DraftLeaderboardResponse,
} from '@/services/gamesService';
import { useGameStore } from '@/stores/useGameStore';

function formatCountdownLabel(): string {
  const ms = getMsUntilNextLocalDay();
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export default function DailyDraftGame() {
  const { selectedLeague } = useLeagueContext();
  const { fetchWithLeague } = useLeagueAPI();
  const { pool, isLoading, isError } = useGamePool();

  const draftProgress = useGameStore((s) => s.draftProgress);
  const draftStreak = useGameStore((s) => s.draftStreak);
  const setDraftProgress = useGameStore((s) => s.setDraftProgress);
  const clearDraftProgressIfNewDay = useGameStore((s) => s.clearDraftProgressIfNewDay);
  const updateDraftStreak = useGameStore((s) => s.updateDraftStreak);

  const today = getLocalDateISO();
  const [selected, setSelected] = useState<string[]>([]);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [countdownLabel, setCountdownLabel] = useState(formatCountdownLabel);
  const [leaderboard, setLeaderboard] = useState<DraftLeaderboardResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => setCountdownLabel(formatCountdownLabel()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      clearDraftProgressIfNewDay(today, selectedLeague);
    }
  }, [today, selectedLeague, clearDraftProgressIfNewDay]);

  useEffect(() => {
    setSelected([]);
    setLeaderboard(null);
  }, [selectedLeague, today]);

  const draftPool = useMemo(() => {
    if (!pool || !selectedLeague) {
      return null;
    }
    return buildDailyDraftPool({ pool, league: selectedLeague, date: today });
  }, [pool, selectedLeague, today]);

  const isCompletedToday =
    draftProgress?.completed &&
    draftProgress.date === today &&
    draftProgress.league === selectedLeague;

  const selectedPlayers = draftPool?.players.filter((p) => selected.includes(p.name)) ?? [];
  const spent = draftPool ? lineupCost(draftPool.players, selected) : 0;
  const budget = draftPool?.brief.budget ?? 0;
  const battersSelected = selectedPlayers.filter((p) => p.role === 'batter').length;
  const bowlersSelected = selectedPlayers.filter((p) => p.role === 'bowler').length;
  const battersNeeded = draftPool?.brief.squadShape.batters ?? 0;
  const bowlersNeeded = draftPool?.brief.squadShape.bowlers ?? 0;
  const squadComplete = battersSelected === battersNeeded && bowlersSelected === bowlersNeeded;
  const canSubmit = squadComplete && spent <= budget && !isCompletedToday && !submitting;

  const togglePlayer = (name: string) => {
    if (isCompletedToday || submitting) {
      return;
    }
    if (selected.includes(name)) {
      setSelected((prev) => prev.filter((n) => n !== name));
      return;
    }
    const player = draftPool?.players.find((p) => p.name === name);
    if (!player || !draftPool) {
      return;
    }
    if (lineupCost(draftPool.players, [...selected, name]) > budget) {
      return;
    }
    if (player.role === 'batter' && battersSelected >= battersNeeded) {
      return;
    }
    if (player.role === 'bowler' && bowlersSelected >= bowlersNeeded) {
      return;
    }
    setSelected((prev) => [...prev, name]);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !draftPool || !selectedLeague) {
      return;
    }

    setSubmitting(true);
    const score = scoreLineup(draftPool.players, selected);
    const optimalScore = draftPool.optimalScore;
    const eff = efficiencyPct(score, optimalScore);

    const progress = {
      date: today,
      league: selectedLeague,
      selectedPlayers: selected,
      score: Math.round(score * 10) / 10,
      optimalScore,
      efficiencyPct: eff,
      completed: true,
    };

    setDraftProgress(progress);
    updateDraftStreak(today, true);

    try {
      const deviceId = getDeviceId();
      await submitDraftScore(fetchWithLeague, {
        deviceId,
        date: today,
        score: progress.score,
        optimalScore,
        lineup: selected,
      });
      const board = await fetchDraftLeaderboard(fetchWithLeague, today, deviceId);
      setLeaderboard(board);
    } catch {
      // Leaderboard is optional; local result still stands
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedLeague || !draftProgress) {
      return;
    }
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

  useEffect(() => {
    if (!isCompletedToday || !selectedLeague || leaderboard) {
      return;
    }
    const deviceId = getDeviceId();
    if (!deviceId) {
      return;
    }
    void fetchDraftLeaderboard(fetchWithLeague, today, deviceId)
      .then(setLeaderboard)
      .catch(() => undefined);
  }, [isCompletedToday, selectedLeague, today, fetchWithLeague, leaderboard]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-black">Loading today&apos;s draft pool...</p>
      </div>
    );
  }

  if (isError || !pool || !draftPool) {
    return (
      <p className="text-center font-bold text-[#FF5E5B] py-4">
        Could not load player data for Daily Draft.
      </p>
    );
  }

  const { brief } = draftPool;
  const batterPool = draftPool.players.filter((p) => p.role === 'batter');
  const bowlerPool = draftPool.players.filter((p) => p.role === 'bowler');

  if (isCompletedToday && draftProgress) {
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

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
      <GameScoreBar label="Daily Draft" streak={draftStreak} />

      <div className="w-full max-w-2xl border-2 border-black bg-[#FFED66] p-3 text-center">
        <p className="text-sm sm:text-base font-black uppercase text-black">{brief.themeLabel}</p>
        <p className="text-xs sm:text-sm font-bold text-black/80 mt-1">{brief.themeDescription}</p>
        <p className="text-xs font-bold text-black mt-2">
          Pick {battersNeeded} batters + {bowlersNeeded} bowlers · Budget {budget} credits
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="flex justify-between text-xs font-black uppercase text-black mb-1">
          <span>
            Budget: {spent}/{budget}
          </span>
          <span>
            Squad: {battersSelected}/{battersNeeded} BAT · {bowlersSelected}/{bowlersNeeded} BWL
          </span>
        </div>
        <div className="h-3 border-2 border-black bg-white">
          <div
            className={`h-full transition-all ${spent > budget ? 'bg-[#FF5E5B]' : 'bg-[#4ECDC4]'}`}
            style={{ width: `${Math.min(100, (spent / budget) * 100)}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <p className="text-xs font-black uppercase text-black mb-2">Batters</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {batterPool.map((player) => (
            <DraftPlayerTile
              key={player.name}
              player={player}
              selected={selected.includes(player.name)}
              disabled={
                (!selected.includes(player.name) && battersSelected >= battersNeeded) ||
                (!selected.includes(player.name) &&
                  lineupCost(draftPool.players, [...selected, player.name]) > budget)
              }
              onToggle={() => togglePlayer(player.name)}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <p className="text-xs font-black uppercase text-black mb-2">Bowlers</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {bowlerPool.map((player) => (
            <DraftPlayerTile
              key={player.name}
              player={player}
              selected={selected.includes(player.name)}
              disabled={
                (!selected.includes(player.name) && bowlersSelected >= bowlersNeeded) ||
                (!selected.includes(player.name) &&
                  lineupCost(draftPool.players, [...selected, player.name]) > budget)
              }
              onToggle={() => togglePlayer(player.name)}
            />
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={() => void handleSubmit()}
        disabled={!canSubmit}
        className="!text-black mt-2"
      >
        {submitting ? 'Submitting...' : 'Lock in lineup'}
      </Button>
    </div>
  );
}
