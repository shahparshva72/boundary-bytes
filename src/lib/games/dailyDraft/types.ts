import type { GamePool } from '@/lib/games/types';
import type { League } from '@/types/league';

export type DraftThemeId =
  | 'power_hitter'
  | 'boundary_king'
  | 'run_machine'
  | 'strike_master'
  | 'wicket_hunter'
  | 'economy_expert';

export interface SquadShape {
  batters: number;
  bowlers: number;
}

export interface DailyDraftBrief {
  date: string;
  league: League;
  seed: string;
  budget: number;
  squadShape: SquadShape;
  themeId: DraftThemeId;
  themeLabel: string;
  themeDescription: string;
}

export interface DraftPlayerStats {
  runs?: number;
  strikeRate?: number;
  sixes?: number;
  fours?: number;
  wickets?: number;
  economy?: number;
}

export interface DraftPlayer {
  name: string;
  role: 'batter' | 'bowler';
  price: number;
  fantasyPoints: number;
  stats: DraftPlayerStats;
}

export interface DailyDraftPool {
  brief: DailyDraftBrief;
  players: DraftPlayer[];
  optimalScore: number;
  optimalLineup: string[];
}

export interface DailyDraftProgress {
  date: string;
  league: League;
  selectedPlayers: string[];
  score: number;
  optimalScore: number;
  efficiencyPct: number;
  completed: boolean;
}

export interface DraftPoolInput {
  pool: GamePool;
  league: League;
  date: string;
}
