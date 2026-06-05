'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import GameResultPanel from '@/components/games/shared/GameResultPanel';
import GameScoreBar from '@/components/games/shared/GameScoreBar';
import PlayerChoiceCard from '@/components/games/shared/PlayerChoiceCard';
import { Button, Spinner } from '@/components/ui';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';
import { fetchMatchupRound } from '@/hooks/useStatsAPI';
import { mapMatchupRoundResponse, type MatchupRoundApiResponse } from '@/lib/games/matchupRound';
import { getMatchupLink } from '@/lib/games/statLabels';
import type { MatchupOption, MatchupShowdownQuestion } from '@/lib/games/types';
import { useGameStore } from '@/stores/useGameStore';

const TOTAL_ROUNDS = 5;

function defaultRevealLabel(option: MatchupOption): string {
  return `${option.dismissals} dismissals · SR ${option.strikeRate.toFixed(1)}`;
}

export default function MatchupShowdownGame() {
  const { selectedLeague } = useLeagueContext();
  const { fetchWithLeague } = useLeagueAPI();
  const setMatchupBestScore = useGameStore((s) => s.setMatchupBestScore);
  const bestScore = useGameStore((s) => (selectedLeague ? s.matchupBestScore[selectedLeague] : 0));

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<MatchupShowdownQuestion | null>(null);
  const [loadingRound, setLoadingRound] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [pickedOpponent, setPickedOpponent] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const loadRequestIdRef = useRef(0);

  const loadRound = useCallback(async () => {
    if (!selectedLeague) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    setLoadingRound(true);
    setLoadError(false);
    setRevealed(false);
    setPickedOpponent(null);
    setQuestion(null);

    try {
      const seed = `${selectedLeague}-matchup-${round}-${Date.now()}`;
      const response = (await fetchMatchupRound(fetchWithLeague, seed)) as MatchupRoundApiResponse;
      const next = mapMatchupRoundResponse(response);

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setQuestion(next);
    } catch {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }
      setLoadError(true);
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoadingRound(false);
      }
    }
  }, [selectedLeague, round, fetchWithLeague]);

  useEffect(() => {
    if (sessionComplete || loadError || !selectedLeague) {
      return;
    }
    void loadRound();
  }, [round, sessionComplete, loadError, selectedLeague, loadRound]);

  const handlePick = (opponent: string) => {
    if (!question || revealed || loadingRound) {
      return;
    }
    setPickedOpponent(opponent);
    setRevealed(true);

    const correct = opponent === question.correctOpponent;
    const nextScore = correct ? score + 1 : score;
    if (correct) {
      setScore(nextScore);
    }

    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        if (selectedLeague) {
          setMatchupBestScore(selectedLeague, nextScore);
        }
        setSessionComplete(true);
      } else {
        setRound((r) => r + 1);
      }
    }, 1800);
  };

  const handlePlayAgain = () => {
    loadRequestIdRef.current += 1;
    setRound(1);
    setScore(0);
    setSessionComplete(false);
    setLoadError(false);
    setQuestion(null);
    setRevealed(false);
    setPickedOpponent(null);
    setLoadingRound(true);
  };

  const handleRetry = () => {
    setLoadError(false);
    void loadRound();
  };

  const formatReveal = question?.revealLabel ?? defaultRevealLabel;

  if (loadingRound && !question) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-black">Loading matchup...</p>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <GameResultPanel
        title="Session complete"
        subtitle={`You scored ${score}/${TOTAL_ROUNDS} · Best: ${Math.max(bestScore, score)}`}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (loadError || (!loadingRound && !question)) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-center font-bold text-[#FF5E5B]">
          Could not build a matchup round. Try again.
        </p>
        <Button variant="primary" onClick={handleRetry} className="!text-black">
          Retry
        </Button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-black">Loading matchup...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
      <GameScoreBar
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={score}
        label="Matchup Showdown"
      />
      <p className="text-sm sm:text-base font-bold text-black text-center max-w-xl px-2">
        {question.prompt}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
        {question.options.map((option) => {
          const isCorrect = option.opponent === question.correctOpponent;
          const isWrong = revealed && pickedOpponent === option.opponent && !isCorrect;
          return (
            <PlayerChoiceCard
              key={option.opponent}
              name={option.opponent}
              revealed={revealed}
              formattedValue={revealed ? formatReveal(option) : undefined}
              selected={pickedOpponent === option.opponent}
              isCorrect={revealed && isCorrect}
              isWrong={isWrong}
              disabled={revealed || loadingRound}
              onClick={() => handlePick(option.opponent)}
            />
          );
        })}
      </div>
      {revealed && (
        <Link
          href={getMatchupLink(question.batter, question.correctOpponent)}
          className="text-sm font-bold text-black underline hover:text-[#FF5E5B]"
        >
          See full matchup →
        </Link>
      )}
    </div>
  );
}
