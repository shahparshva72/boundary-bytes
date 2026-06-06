import type { League } from '@/types/league';
import type { SeededRandom } from './seededRandom';
import { getMetricLabel } from './statLabels';
import type {
  DailyQuestionSlot,
  GamePool,
  GamePoolPlayer,
  MatchupShowdownQuestion,
  StatCategory,
  StatGuesserQuestion,
  StatMetric,
} from './types';

const BATTING_METRICS: StatMetric[] = ['runs', 'strikeRate', 'sixes', 'fours'];
const BOWLING_METRICS: StatMetric[] = ['wickets', 'economy'];

function getMetricValue(player: GamePoolPlayer, metric: StatMetric): number | null {
  const value = player[metric as keyof GamePoolPlayer];
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return value;
}

function isValidPair(a: number, b: number, metric: StatMetric, minGapRatio = 0.1): boolean {
  if (a === b) {
    return false;
  }
  if (metric === 'strikeRate' || metric === 'economy') {
    if (a <= 0 || b <= 0) {
      return false;
    }
  }
  const max = Math.max(Math.abs(a), Math.abs(b));
  const min = Math.min(Math.abs(a), Math.abs(b));
  if (max === 0) {
    return false;
  }
  return (max - min) / max >= minGapRatio;
}

function pickCorrectSide(
  valueA: number,
  valueB: number,
  metric: StatMetric,
  swapped: boolean,
): 'left' | 'right' {
  const lowerWins = metric === 'economy';
  let aWins: boolean;
  if (lowerWins) {
    aWins = valueA < valueB;
  } else {
    aWins = valueA > valueB;
  }
  if (swapped) {
    return aWins ? 'right' : 'left';
  }
  return aWins ? 'left' : 'right';
}

export function generateStatGuesserQuestion(
  pool: GamePool,
  league: League,
  rng: () => number = Math.random,
  usedKeys: Set<string> = new Set(),
): StatGuesserQuestion | null {
  const category: StatCategory = rng() < 0.5 ? 'batting' : 'bowling';
  const players = category === 'batting' ? pool.batters : pool.bowlers;
  const metrics = category === 'batting' ? BATTING_METRICS : BOWLING_METRICS;

  if (players.length < 2) {
    return null;
  }

  for (let attempt = 0; attempt < 50; attempt++) {
    const metric = metrics[Math.floor(rng() * metrics.length)]!;
    const idxA = Math.floor(rng() * players.length);
    let idxB = Math.floor(rng() * players.length);
    while (idxB === idxA) {
      idxB = Math.floor(rng() * players.length);
    }

    const playerA = players[idxA]!;
    const playerB = players[idxB]!;
    const valueA = getMetricValue(playerA, metric);
    const valueB = getMetricValue(playerB, metric);

    if (valueA === null || valueB === null) {
      continue;
    }
    if (!isValidPair(valueA, valueB, metric)) {
      continue;
    }

    const key = `${category}-${metric}-${[playerA.player, playerB.player].sort().join('|')}`;
    if (usedKeys.has(key)) {
      continue;
    }
    usedKeys.add(key);

    const swapped = rng() < 0.5;
    const left = swapped ? playerB : playerA;
    const right = swapped ? playerA : playerB;
    const leftValue = swapped ? valueB : valueA;
    const rightValue = swapped ? valueA : valueB;

    return {
      type: 'stat-guesser',
      category,
      metric,
      playerA: { name: left.player, value: leftValue },
      playerB: { name: right.player, value: rightValue },
      correctSide: pickCorrectSide(valueA, valueB, metric, swapped),
      prompt: getMetricLabel(metric, category, league),
    };
  }

  return null;
}

export function generateDailyQuestions(
  pool: GamePool,
  league: League,
  rng: SeededRandom,
  count = 4,
): StatGuesserQuestion[] {
  const usedKeys = new Set<string>();
  const questions: StatGuesserQuestion[] = [];

  for (let i = 0; i < count * 3 && questions.length < count; i++) {
    const q = generateStatGuesserQuestion(pool, league, () => rng.next(), usedKeys);
    if (q) {
      questions.push(q);
    }
  }

  return questions;
}

export function buildDailyQuestionSlots(
  statQuestions: StatGuesserQuestion[],
  matchupQuestion: MatchupShowdownQuestion | null,
  rng: SeededRandom,
  pool?: GamePool,
  league?: League,
): DailyQuestionSlot[] {
  const slots: DailyQuestionSlot[] = statQuestions.map((question) => ({
    kind: 'stat' as const,
    question,
  }));

  if (matchupQuestion) {
    slots.push({ kind: 'matchup', question: matchupQuestion });
  }

  let shuffled = rng.shuffle(slots);

  while (shuffled.length < 5 && pool && league) {
    const extra = generateStatGuesserQuestion(pool, league, () => rng.next());
    if (extra) {
      shuffled.push({ kind: 'stat', question: extra });
    } else {
      break;
    }
  }

  return shuffled.slice(0, 5);
}
