'use client';

import { useMemo, useState } from 'react';
import DraftPlayerTile from '@/components/games/daily-draft/DraftPlayerTile';
import GameScoreBar from '@/components/games/shared/GameScoreBar';
import { Button } from '@/components/ui';
import {
  efficiencyPct,
  lineupCost,
  scoreLineup,
  type DailyDraftPool,
} from '@/lib/games/dailyDraft';
import { getDeviceId } from '@/lib/games/deviceId';
import { submitDraftScore } from '@/services/gamesService';
import { useGameStore } from '@/stores/useGameStore';
import type { League } from '@/types/league';

interface DailyDraftBoardProps {
  draftPool: DailyDraftPool;
  today: string;
  selectedLeague: League;
  draftStreak: number;
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function DailyDraftBoard({
  draftPool,
  today,
  selectedLeague,
  draftStreak,
  fetchWithLeague,
}: DailyDraftBoardProps) {
  const setDraftProgress = useGameStore((s) => s.setDraftProgress);
  const updateDraftStreak = useGameStore((s) => s.updateDraftStreak);

  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const playerById = useMemo(
    () => new Map(draftPool.players.map((player) => [player.id, player])),
    [draftPool],
  );

  const selectedPlayers = useMemo(
    () =>
      selected
        .map((id) => playerById.get(id))
        .filter((player): player is NonNullable<typeof player> => player != null),
    [selected, playerById],
  );

  const spent = lineupCost(draftPool.players, selected);
  const budget = draftPool.brief.budget;
  const battersSelected = selectedPlayers.filter((p) => p.role === 'batter').length;
  const bowlersSelected = selectedPlayers.filter((p) => p.role === 'bowler').length;
  const battersNeeded = draftPool.brief.squadShape.batters;
  const bowlersNeeded = draftPool.brief.squadShape.bowlers;
  const squadComplete = battersSelected === battersNeeded && bowlersSelected === bowlersNeeded;
  const canSubmit = squadComplete && spent <= budget && !submitting;

  const playerDisabled = useMemo(() => {
    const disabled = new Map<string, boolean>();

    for (const player of draftPool.players) {
      if (selected.includes(player.id)) {
        disabled.set(player.id, false);
        continue;
      }

      const roleFull =
        player.role === 'batter'
          ? battersSelected >= battersNeeded
          : bowlersSelected >= bowlersNeeded;
      disabled.set(player.id, roleFull || spent + player.price > budget);
    }

    return disabled;
  }, [
    draftPool,
    selected,
    battersSelected,
    battersNeeded,
    bowlersSelected,
    bowlersNeeded,
    spent,
    budget,
  ]);

  const togglePlayer = (playerId: string) => {
    if (submitting) {
      return;
    }
    if (selected.includes(playerId)) {
      setSelected((prev) => prev.filter((id) => id !== playerId));
      return;
    }
    if (playerDisabled.get(playerId)) {
      return;
    }
    setSelected((prev) => [...prev, playerId]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

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

    try {
      const deviceId = getDeviceId();
      await submitDraftScore(fetchWithLeague, {
        deviceId,
        date: today,
        score: progress.score,
        optimalScore,
        lineup: selected,
      });

      setDraftProgress(progress);
      updateDraftStreak(today, true);
    } catch {
      setSubmitError('Could not submit your score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const { brief } = draftPool;
  const batterPool = draftPool.players.filter((p) => p.role === 'batter');
  const bowlerPool = draftPool.players.filter((p) => p.role === 'bowler');

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
              key={player.id}
              player={player}
              selected={selected.includes(player.id)}
              disabled={playerDisabled.get(player.id) ?? false}
              onToggle={() => togglePlayer(player.id)}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <p className="text-xs font-black uppercase text-black mb-2">Bowlers</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {bowlerPool.map((player) => (
            <DraftPlayerTile
              key={player.id}
              player={player}
              selected={selected.includes(player.id)}
              disabled={playerDisabled.get(player.id) ?? false}
              onToggle={() => togglePlayer(player.id)}
            />
          ))}
        </div>
      </div>

      {submitError && <p className="text-sm font-bold text-[#FF5E5B] text-center">{submitError}</p>}

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
