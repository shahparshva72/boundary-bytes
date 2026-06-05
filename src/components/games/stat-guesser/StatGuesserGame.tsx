'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import GameResultPanel from '@/components/games/shared/GameResultPanel';
import GameScoreBar from '@/components/games/shared/GameScoreBar';
import PlayerChoiceCard from '@/components/games/shared/PlayerChoiceCard';
import StatRevealBar from '@/components/games/shared/StatRevealBar';
import { Spinner } from '@/components/ui';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useGamePool } from '@/hooks/useGamePool';
import { generateStatGuesserQuestion } from '@/lib/games/questionGenerator';
import { formatStatValue, getStatsTabLink } from '@/lib/games/statLabels';
import type { StatGuesserQuestion } from '@/lib/games/types';
import { useGameStore } from '@/stores/useGameStore';

const REVEAL_DELAY_MS = 1500;

export default function StatGuesserGame() {
  const { selectedLeague } = useLeagueContext();
  const { pool, isLoading, isError } = useGamePool();
  const setStatGuesserBestStreak = useGameStore((s) => s.setStatGuesserBestStreak);
  const bestStreak = useGameStore((s) =>
    selectedLeague ? s.statGuesserBestStreak[selectedLeague] : 0,
  );

  const [question, setQuestion] = useState<StatGuesserQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [pickedSide, setPickedSide] = useState<'left' | 'right' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const usedKeysRef = useRef(new Set<string>());
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadQuestion = useCallback(() => {
    if (!pool || !selectedLeague) {
      return;
    }
    const next = generateStatGuesserQuestion(
      pool,
      selectedLeague,
      Math.random,
      usedKeysRef.current,
    );
    setQuestion(next);
    setRevealed(false);
    setPickedSide(null);
  }, [pool, selectedLeague]);

  useEffect(() => {
    if (pool && selectedLeague && !question && !gameOver) {
      loadQuestion();
    }
  }, [pool, selectedLeague, question, gameOver, loadQuestion]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const handlePick = (side: 'left' | 'right') => {
    if (!question || revealed || gameOver) {
      return;
    }

    const correct = side === question.correctSide;
    setPickedSide(side);
    setRevealed(true);

    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (selectedLeague) {
        setStatGuesserBestStreak(selectedLeague, nextStreak);
      }
      advanceTimerRef.current = setTimeout(() => {
        setQuestion(null);
      }, REVEAL_DELAY_MS);
    } else {
      setGameOver(true);
    }
  };

  const handlePlayAgain = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
    usedKeysRef.current = new Set();
    setStreak(0);
    setGameOver(false);
    setRevealed(false);
    setPickedSide(null);
    setQuestion(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !pool) {
    return (
      <p className="text-center font-bold text-[#FF5E5B] py-4">
        Could not load player data. Try again later.
      </p>
    );
  }

  if (gameOver && !question) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[240px]">
        <GameResultPanel
          title="Game over"
          subtitle={`Final streak: ${streak} · Best: ${bestStreak}`}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  const formattedA = formatStatValue(question.metric, question.playerA.value);
  const formattedB = formatStatValue(question.metric, question.playerB.value);
  const statsLink = getStatsTabLink(question.category);

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
      {gameOver ? (
        <GameResultPanel
          title="Game over"
          subtitle={`Final streak: ${streak} · Best: ${bestStreak}`}
          onPlayAgain={handlePlayAgain}
        />
      ) : (
        <GameScoreBar streak={streak} label="Stat Guesser" />
      )}
      <p className="text-sm sm:text-base font-bold text-black text-center max-w-xl px-2">
        {question.prompt}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        <PlayerChoiceCard
          name={question.playerA.name}
          formattedValue={formattedA}
          revealed={revealed || gameOver}
          selected={pickedSide === 'left'}
          isCorrect={(revealed || gameOver) && question.correctSide === 'left'}
          isWrong={
            (revealed || gameOver) && pickedSide === 'left' && question.correctSide !== 'left'
          }
          disabled={revealed || gameOver}
          onClick={() => handlePick('left')}
        />
        <PlayerChoiceCard
          name={question.playerB.name}
          formattedValue={formattedB}
          revealed={revealed || gameOver}
          selected={pickedSide === 'right'}
          isCorrect={(revealed || gameOver) && question.correctSide === 'right'}
          isWrong={
            (revealed || gameOver) && pickedSide === 'right' && question.correctSide !== 'right'
          }
          disabled={revealed || gameOver}
          onClick={() => handlePick('right')}
        />
      </div>
      {(revealed || gameOver) && (
        <div className="w-full flex flex-col items-center gap-3">
          <StatRevealBar
            labelA={question.playerA.name}
            valueA={question.playerA.value}
            labelB={question.playerB.name}
            valueB={question.playerB.value}
            formattedA={formattedA}
            formattedB={formattedB}
            highlightSide={question.correctSide}
          />
          <Link
            href={statsLink}
            className="text-sm font-bold text-black underline hover:text-[#FF5E5B]"
          >
            See full stats →
          </Link>
        </div>
      )}
    </div>
  );
}
