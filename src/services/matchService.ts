import goApi from '@/services/api';

export interface MatchBattingRow {
  player: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal: string;
  notOut: boolean;
}

export interface MatchBowlingRow {
  player: string;
  overs: number;
  balls: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  dotBalls: number;
  wides: number;
  noballs: number;
}

export interface MatchPartnership {
  wicket: number;
  batter1: string;
  batter2: string;
  runs: number;
  balls: number;
  batter1Runs: number;
  batter2Runs: number;
  batter1Balls: number;
  batter2Balls: number;
  unbroken: boolean;
}

export interface MatchOver {
  over: number;
  runs: number;
  wickets: number;
  cumulativeRuns: number;
  cumulativeWickets: number;
}

export interface MatchPhaseSummary {
  phase: 'powerplay' | 'middle' | 'death';
  runs: number;
  balls: number;
  wickets: number;
  runRate: number;
}

export interface MatchFallOfWicket {
  wicketNumber: number;
  over: string;
  runsAtFall: number;
  batsmanOut: string;
  dismissalType: string;
  bowler: string;
}

export interface MatchInnings {
  innings: number;
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
  extras: {
    total: number;
    wides: number;
    noballs: number;
    byes: number;
    legbyes: number;
    penalty: number;
  };
  batting: MatchBattingRow[];
  bowling: MatchBowlingRow[];
  partnerships: MatchPartnership[];
  overByOver: MatchOver[];
  phases: MatchPhaseSummary[];
  fallOfWickets: MatchFallOfWicket[];
}

export interface MatchDetail {
  match: {
    id: number;
    league: string;
    season: string;
    date: string;
    venue: string;
    city: string;
    teams: string[];
    tossWinner: string;
    tossDecision: string;
    playerOfMatch?: string;
    result: string;
    ballsPerOver: number;
  };
  innings: MatchInnings[];
}

export async function getMatchDetail(id: string): Promise<MatchDetail | null> {
  if (!/^\d+$/.test(id)) {
    return null;
  }
  const res = await goApi.get(`matches/${id}`, {
    throwHttpErrors: false,
    fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } } as RequestInit),
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to fetch match');
  }
  return res.json();
}
