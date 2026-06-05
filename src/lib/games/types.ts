import type { League } from '@/types/league';

export type StatMetric = 'runs' | 'strikeRate' | 'sixes' | 'fours' | 'wickets' | 'economy';

export type StatCategory = 'batting' | 'bowling';

export interface GamePlayer {
  name: string;
  value: number;
}

export interface StatGuesserQuestion {
  type: 'stat-guesser';
  category: StatCategory;
  metric: StatMetric;
  playerA: GamePlayer;
  playerB: GamePlayer;
  correctSide: 'left' | 'right';
  prompt: string;
}

export interface MatchupOption {
  opponent: string;
  runsScored: number;
  ballsFaced: number;
  dismissals: number;
  strikeRate: number;
}

export interface MatchupShowdownQuestion {
  type: 'matchup-showdown';
  batter: string;
  options: MatchupOption[];
  correctOpponent: string;
  prompt: string;
  revealLabel?: (option: MatchupOption) => string;
}

export type GameQuestion = StatGuesserQuestion | MatchupShowdownQuestion;

export type DailyQuestionSlot =
  | { kind: 'stat'; question: StatGuesserQuestion }
  | { kind: 'matchup'; question: MatchupShowdownQuestion };

export interface DailyProgress {
  date: string;
  league: League;
  score: number;
  answers: boolean[];
  completed: boolean;
}

export interface GamePoolPlayer {
  player: string;
  runs?: number;
  strikeRate?: number;
  sixes?: number;
  fours?: number;
  wickets?: number;
  economy?: number;
}

export interface GamePool {
  batters: GamePoolPlayer[];
  bowlers: GamePoolPlayer[];
}
