import type {
  StatExplorerDimension,
  StatExplorerMetric,
  StatExplorerReportType,
  StatExplorerResultFilter,
  StatExplorerTossDecisionFilter,
} from './contracts';

export const ALLOWED_DIMENSIONS: Record<StatExplorerReportType, StatExplorerDimension[]> = {
  batting: [
    'season',
    'player',
    'team',
    'opposition',
    'venue',
    'city',
    'tossWinner',
    'tossDecision',
    'result',
    'date',
    'innings',
    'battingHand',
    'bowlingType',
    'bowlingSubType',
    'opponentBattingHand',
    'opponentBowlingType',
    'opponentBowlingSubType',
    'playingRole',
  ],
  bowling: [
    'season',
    'player',
    'team',
    'opposition',
    'venue',
    'city',
    'tossWinner',
    'tossDecision',
    'result',
    'date',
    'innings',
    'battingHand',
    'bowlingType',
    'bowlingSubType',
    'opponentBattingHand',
    'opponentBowlingType',
    'opponentBowlingSubType',
    'playingRole',
  ],
  team: ['season', 'team', 'venue', 'city', 'tossWinner', 'tossDecision', 'result', 'date'],
  match: [
    'season',
    'team',
    'opposition',
    'venue',
    'city',
    'tossWinner',
    'tossDecision',
    'result',
    'date',
    'innings',
  ],
};

export const ALLOWED_METRICS: Record<StatExplorerReportType, StatExplorerMetric[]> = {
  batting: [
    'runs',
    'ballsFaced',
    'innings',
    'notOuts',
    'highestScore',
    'fours',
    'sixes',
    'fifties',
    'hundreds',
    'strikeRate',
    'average',
    'dismissals',
    'dotBalls',
  ],
  bowling: [
    'wickets',
    'ballsBowled',
    'runsConceded',
    'innings',
    'economyRate',
    'bowlingAverage',
    'bowlingStrikeRate',
    'fourWickets',
    'fiveWickets',
    'dotBalls',
  ],
  team: ['matchesPlayed', 'wins', 'losses', 'winPct', 'winsBattingFirst', 'winsBattingSecond'],
  match: ['matches', 'runs', 'wickets', 'ballsFaced', 'ballsBowled', 'economyRate', 'strikeRate'],
};

export const DIMENSION_LABELS: Record<StatExplorerDimension, string> = {
  season: 'Season',
  player: 'Player',
  team: 'Team',
  opposition: 'Opposition',
  venue: 'Venue',
  city: 'City',
  tossWinner: 'Toss Winner',
  tossDecision: 'Toss Decision',
  result: 'Result',
  date: 'Date',
  innings: 'Innings',
  over: 'Over',
  battingHand: 'Player Batting Hand',
  bowlingType: 'Player Bowling Type',
  bowlingSubType: 'Player Bowling Sub-Type',
  opponentBattingHand: 'Opponent Batting Hand',
  opponentBowlingType: 'Opponent Bowling Type',
  opponentBowlingSubType: 'Opponent Bowling Sub-Type',
  playingRole: 'Playing Role',
};

export const METRIC_LABELS: Record<StatExplorerMetric, string> = {
  runs: 'Runs',
  ballsFaced: 'Balls Faced',
  innings: 'Innings',
  notOuts: 'Not Outs',
  highestScore: 'Highest Score',
  fours: 'Fours',
  sixes: 'Sixes',
  fifties: '50s',
  hundreds: '100s',
  strikeRate: 'Strike Rate',
  average: 'Average',
  dismissals: 'Dismissals',
  dotBalls: 'Dot Balls',
  wickets: 'Wickets',
  ballsBowled: 'Balls Bowled',
  runsConceded: 'Runs Conceded',
  economyRate: 'Economy Rate',
  bowlingAverage: 'Bowling Average',
  bowlingStrikeRate: 'Bowling SR',
  fourWickets: '4 Wickets',
  fiveWickets: '5 Wickets',
  matchesPlayed: 'Matches',
  wins: 'Wins',
  losses: 'Losses',
  winPct: 'Win %',
  matches: 'Matches',
  winsBattingFirst: 'Batting 1st Wins',
  winsBattingSecond: 'Batting 2nd Wins',
};

export const PHASE_OVER_RANGES: Record<
  Exclude<StatExplorerPhaseFilter, 'overall'>,
  [number, number]
> = {
  powerplay: [1, 6],
  middle: [7, 15],
  death: [16, 20],
};

type StatExplorerPhaseFilter = 'powerplay' | 'middle' | 'death' | 'overall';

export const TOSS_DECISIONS: StatExplorerTossDecisionFilter[] = ['bat', 'field'];

export const RESULT_FILTERS: StatExplorerResultFilter[] = ['won', 'lost', 'noresult'];

export const REPORT_TYPE_LABELS: Record<StatExplorerReportType, string> = {
  batting: 'Batting',
  bowling: 'Bowling',
  team: 'Team',
  match: 'Match',
};

export const DEFAULT_DIMENSIONS: Record<StatExplorerReportType, StatExplorerDimension[]> = {
  batting: ['player'],
  bowling: ['player'],
  team: ['team'],
  match: ['team'],
};

export const DEFAULT_METRICS: Record<StatExplorerReportType, StatExplorerMetric[]> = {
  batting: ['runs', 'ballsFaced', 'strikeRate', 'average', 'fours', 'sixes'],
  bowling: ['wickets', 'ballsBowled', 'economyRate', 'bowlingAverage', 'bowlingStrikeRate'],
  team: ['matchesPlayed', 'wins', 'losses', 'winPct'],
  match: ['matches', 'runs', 'wickets'],
};
