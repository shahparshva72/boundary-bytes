'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GameResultPanel from '@/components/games/shared/GameResultPanel';
import GameScoreBar from '@/components/games/shared/GameScoreBar';
import PlayerChoiceCard from '@/components/games/shared/PlayerChoiceCard';
import StatRevealBar from '@/components/games/shared/StatRevealBar';
import { Spinner } from '@/components/ui';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useGamePool } from '@/hooks/useGamePool';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';
import { fetchMatchupRound } from '@/hooks/useStatsAPI';
import { mapMatchupRoundResponse, type MatchupRoundApiResponse } from '@/lib/games/matchupRound';
import { buildDailyQuestionSlots, generateDailyQuestions } from '@/lib/games/questionGenerator';
import {
  createSeededRandom,
  getLocalDateISO,
  getMsUntilNextLocalDay,
} from '@/lib/games/seededRandom';
import { copyToClipboard, formatDailyShareText } from '@/lib/games/shareText';
import { formatStatValue, getMatchupLink, getStatsTabLink } from '@/lib/games/statLabels';
import type {
  DailyQuestionSlot,
  MatchupShowdownQuestion,
  StatGuesserQuestion,
} from '@/lib/games/types';
import { useGameStore } from '@/stores/useGameStore';

const TOTAL_QUESTIONS = 5;

async function buildSeededMatchupQuestion(
  fetchWithLeague: (url: string) => Promise<Response>,
  league: string,
  today: string,
): Promise<MatchupShowdownQuestion | null> {
  try {
    const seed = `${league}-${today}-matchup`;
    const response = (await fetchMatchupRound(fetchWithLeague, seed)) as MatchupRoundApiResponse;
    return mapMatchupRoundResponse(response);
  } catch {
    return null;
  }
}

function StatQuestionView({
  question,
  revealed,
  pickedSide,
  onPick,
}: {
  question: StatGuesserQuestion;
  revealed: boolean;
  pickedSide: 'left' | 'right' | null;
  onPick: (side: 'left' | 'right') => void;
}) {
  const formattedA = formatStatValue(question.metric, question.playerA.value);
  const formattedB = formatStatValue(question.metric, question.playerB.value);

  return (
    <>
      <p className="text-sm sm:text-base font-bold text-black text-center max-w-xl px-2">
        {question.prompt}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        <PlayerChoiceCard
          name={question.playerA.name}
          formattedValue={formattedA}
          revealed={revealed}
          selected={pickedSide === 'left'}
          isCorrect={revealed && question.correctSide === 'left'}
          isWrong={revealed && pickedSide === 'left' && question.correctSide !== 'left'}
          disabled={revealed}
          onClick={() => onPick('left')}
        />
        <PlayerChoiceCard
          name={question.playerB.name}
          formattedValue={formattedB}
          revealed={revealed}
          selected={pickedSide === 'right'}
          isCorrect={revealed && question.correctSide === 'right'}
          isWrong={revealed && pickedSide === 'right' && question.correctSide !== 'right'}
          disabled={revealed}
          onClick={() => onPick('right')}
        />
      </div>
      {revealed && (
        <StatRevealBar
          labelA={question.playerA.name}
          valueA={question.playerA.value}
          labelB={question.playerB.name}
          valueB={question.playerB.value}
          formattedA={formattedA}
          formattedB={formattedB}
          highlightSide={question.correctSide}
        />
      )}
    </>
  );
}

export default function DailyChallengeGame() {
  const { selectedLeague } = useLeagueContext();
  const { fetchWithLeague } = useLeagueAPI();
  const { pool, isLoading: poolLoading, isError: poolError } = useGamePool();

  const dailyProgress = useGameStore((s) => s.dailyProgress);
  const dailyStreak = useGameStore((s) => s.dailyStreak);
  const setDailyProgress = useGameStore((s) => s.setDailyProgress);
  const clearDailyProgressIfNewDay = useGameStore((s) => s.clearDailyProgressIfNewDay);
  const updateDailyStreak = useGameStore((s) => s.updateDailyStreak);

  const today = getLocalDateISO();
  const [questions, setQuestions] = useState<DailyQuestionSlot[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [pickedSide, setPickedSide] = useState<'left' | 'right' | null>(null);
  const [pickedOpponent, setPickedOpponent] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLeague) {
      clearDailyProgressIfNewDay(today, selectedLeague);
    }
  }, [today, selectedLeague, clearDailyProgressIfNewDay]);

  const isCompletedToday =
    dailyProgress?.completed &&
    dailyProgress.date === today &&
    dailyProgress.league === selectedLeague;

  const buildQuestions = useCallback(async () => {
    if (!pool || !selectedLeague) {
      return;
    }
    setLoadingQuestions(true);

    const rng = createSeededRandom(`${selectedLeague}-${today}`);
    const statQuestions = generateDailyQuestions(pool, selectedLeague, rng);
    const matchupQuestion = await buildSeededMatchupQuestion(
      fetchWithLeague,
      selectedLeague,
      today,
    );

    const slots = buildDailyQuestionSlots(
      statQuestions,
      matchupQuestion,
      rng,
      pool,
      selectedLeague,
    );
    setQuestions(slots.slice(0, TOTAL_QUESTIONS));
    setLoadingQuestions(false);
  }, [pool, selectedLeague, today, fetchWithLeague]);

  useEffect(() => {
    if (!isCompletedToday && pool) {
      buildQuestions();
    }
  }, [isCompletedToday, pool, buildQuestions]);

  const currentSlot = questions[currentIndex];

  const handleStatPick = (side: 'left' | 'right') => {
    if (!currentSlot || currentSlot.kind !== 'stat' || revealed) {
      return;
    }
    const correct = side === currentSlot.question.correctSide;
    setPickedSide(side);
    setRevealed(true);
    const nextAnswers = [...answers, correct];
    setAnswers(nextAnswers);

    setTimeout(() => advanceQuestion(nextAnswers), 1500);
  };

  const handleMatchupPick = (opponent: string) => {
    if (!currentSlot || currentSlot.kind !== 'matchup' || revealed) {
      return;
    }
    const correct = opponent === currentSlot.question.correctOpponent;
    setPickedOpponent(opponent);
    setRevealed(true);
    const nextAnswers = [...answers, correct];
    setAnswers(nextAnswers);

    setTimeout(() => advanceQuestion(nextAnswers), 1500);
  };

  const advanceQuestion = (nextAnswers: boolean[]) => {
    if (currentIndex + 1 >= questions.length) {
      finishChallenge(nextAnswers);
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
      setPickedSide(null);
      setPickedOpponent(null);
    }
  };

  const finishChallenge = (finalAnswers: boolean[]) => {
    if (!selectedLeague) {
      return;
    }
    const score = finalAnswers.filter(Boolean).length;
    setDailyProgress({
      date: today,
      league: selectedLeague,
      score,
      answers: finalAnswers,
      completed: true,
    });
    updateDailyStreak(today, true);
  };

  const handleShare = async () => {
    if (!selectedLeague || !dailyProgress) {
      return;
    }
    const text = formatDailyShareText(
      selectedLeague,
      dailyProgress.score,
      TOTAL_QUESTIONS,
      dailyStreak,
    );
    const ok = await copyToClipboard(text);
    setShareStatus(ok ? 'Copied!' : 'Copy failed');
    setTimeout(() => setShareStatus(null), 2000);
  };

  const countdownLabel = useMemo(() => {
    const ms = getMsUntilNextLocalDay();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }, []);

  if (poolLoading || loadingQuestions) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-black">Preparing today&apos;s challenge...</p>
      </div>
    );
  }

  if (poolError || !pool) {
    return (
      <p className="text-center font-bold text-[#FF5E5B] py-4">
        Could not load data for the daily challenge.
      </p>
    );
  }

  if (isCompletedToday && dailyProgress) {
    const squares = dailyProgress.answers.map((ok) => (ok ? '🟩' : '🟥')).join('');

    return (
      <GameResultPanel
        title="Daily complete"
        subtitle={`Score: ${dailyProgress.score}/${TOTAL_QUESTIONS} · Streak: ${dailyStreak} · Next in ${countdownLabel}`}
        onShare={handleShare}
        shareLabel={shareStatus ?? 'Share result'}
        showPlayAgain={false}
      >
        <p className="text-2xl tracking-widest">{squares}</p>
        <p className="text-xs font-bold text-black/60">Come back tomorrow for a new challenge.</p>
      </GameResultPanel>
    );
  }

  if (!currentSlot || questions.length === 0) {
    return (
      <p className="text-center font-bold text-black py-4">
        Not enough data to build today&apos;s challenge.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
      <GameScoreBar
        round={currentIndex + 1}
        totalRounds={questions.length}
        score={answers.filter(Boolean).length}
        label="Daily Challenge"
      />

      {currentSlot.kind === 'stat' && (
        <>
          <StatQuestionView
            question={currentSlot.question}
            revealed={revealed}
            pickedSide={pickedSide}
            onPick={handleStatPick}
          />
          {revealed && (
            <Link
              href={getStatsTabLink(currentSlot.question.category)}
              className="text-sm font-bold text-black underline hover:text-[#FF5E5B]"
            >
              See full stats →
            </Link>
          )}
        </>
      )}

      {currentSlot.kind === 'matchup' &&
        (() => {
          const matchupQuestion = currentSlot.question;
          return (
            <>
              <p className="text-sm sm:text-base font-bold text-black text-center max-w-xl px-2">
                {matchupQuestion.prompt}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
                {matchupQuestion.options.map((option) => {
                  const isCorrect = option.opponent === matchupQuestion.correctOpponent;
                  return (
                    <PlayerChoiceCard
                      key={option.opponent}
                      name={option.opponent}
                      revealed={revealed}
                      formattedValue={
                        revealed
                          ? (matchupQuestion.revealLabel?.(option) ??
                            `${option.dismissals} dismissals · SR ${option.strikeRate.toFixed(1)}`)
                          : undefined
                      }
                      selected={pickedOpponent === option.opponent}
                      isCorrect={revealed && isCorrect}
                      isWrong={revealed && pickedOpponent === option.opponent && !isCorrect}
                      disabled={revealed}
                      onClick={() => handleMatchupPick(option.opponent)}
                    />
                  );
                })}
              </div>
              {revealed && (
                <Link
                  href={getMatchupLink(matchupQuestion.batter, matchupQuestion.correctOpponent)}
                  className="text-sm font-bold text-black underline hover:text-[#FF5E5B]"
                >
                  See full matchup →
                </Link>
              )}
            </>
          );
        })()}
    </div>
  );
}
