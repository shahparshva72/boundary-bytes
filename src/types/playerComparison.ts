export interface PlayerComparisonFilters {
  players: string[];
  season?: string;
  team?: string;
  statType: 'batting' | 'bowling' | 'both';
}

export interface BattingStats {
  runs: number;
  ballsFaced: number;
  innings: number;
  notOuts: number;
  highestScore: number;
  strikeRate: number;
  average: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
}

export interface BowlingStats {
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  innings: number;
  economy: number;
  average: number;
  strikeRate: number;
  bestFigures: string;
  fourWickets: number;
  fiveWickets: number;
}

export interface ComparedPlayer {
  name: string;
  team?: string;
  batting?: BattingStats;
  bowling?: BowlingStats;
}

export interface PlayerComparisonData {
  players: ComparedPlayer[];
  filters: {
    season: string | null;
    team: string | null;
    statType: string;
  };
}
