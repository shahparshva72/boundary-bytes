import { z } from 'zod';

export const StatExplorerReportType = z.enum(['batting', 'bowling', 'team', 'match']);
export type StatExplorerReportType = z.infer<typeof StatExplorerReportType>;

export const StatExplorerDimension = z.enum([
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
  'over',
  'battingHand',
  'bowlingType',
  'bowlingSubType',
  'opponentBattingHand',
  'opponentBowlingType',
  'opponentBowlingSubType',
  'playingRole',
]);
export type StatExplorerDimension = z.infer<typeof StatExplorerDimension>;

export const StatExplorerMetric = z.enum([
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
  'wickets',
  'ballsBowled',
  'runsConceded',
  'economyRate',
  'bowlingAverage',
  'bowlingStrikeRate',
  'fourWickets',
  'fiveWickets',
  'matchesPlayed',
  'wins',
  'losses',
  'winPct',
  'matches',
  'winsBattingFirst',
  'winsBattingSecond',
]);
export type StatExplorerMetric = z.infer<typeof StatExplorerMetric>;

export const StatExplorerSortDirection = z.enum(['asc', 'desc']);
export type StatExplorerSortDirection = z.infer<typeof StatExplorerSortDirection>;

export const StatExplorerSortSchema = z.object({
  key: z.string(),
  direction: StatExplorerSortDirection,
});
export type StatExplorerSort = z.infer<typeof StatExplorerSortSchema>;

export const StatExplorerResultFilter = z.enum(['won', 'lost', 'noresult']);
export type StatExplorerResultFilter = z.infer<typeof StatExplorerResultFilter>;

export const StatExplorerTossDecisionFilter = z.enum(['bat', 'field']);
export type StatExplorerTossDecisionFilter = z.infer<typeof StatExplorerTossDecisionFilter>;

export const StatExplorerPhaseFilter = z.enum(['powerplay', 'middle', 'death', 'overall']);
export type StatExplorerPhaseFilter = z.infer<typeof StatExplorerPhaseFilter>;

export const StatExplorerRunRequestSchema = z.object({
  reportType: StatExplorerReportType,
  dimensions: z.array(StatExplorerDimension).min(1).max(3),
  metrics: z.array(StatExplorerMetric).min(1).max(8),
  filters: z.object({
    teams: z.array(z.string()).optional(),
    opposition: z.array(z.string()).optional(),
    seasons: z.array(z.string()).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    venues: z.array(z.string()).optional(),
    cities: z.array(z.string()).optional(),
    tossWinners: z.array(z.string()).optional(),
    tossDecisions: z.array(StatExplorerTossDecisionFilter).optional(),
    innings: z.array(z.union([z.literal(1), z.literal(2)])).optional(),
    overFrom: z.number().int().min(1).max(20).optional(),
    overTo: z.number().int().min(1).max(20).optional(),
    phase: StatExplorerPhaseFilter.optional(),
    resultFilter: StatExplorerResultFilter.optional(),
    minRuns: z.number().int().min(0).optional(),
    maxRuns: z.number().int().min(0).optional(),
    minBalls: z.number().int().min(0).optional(),
    maxBalls: z.number().int().min(0).optional(),
    minWickets: z.number().int().min(0).optional(),
    maxWickets: z.number().int().min(0).optional(),
    // Player style filters
    battingHand: z.enum(['left', 'right']).optional(),
    bowlingType: z.enum(['pace', 'spin']).optional(),
    bowlingSubType: z
      .array(
        z.enum([
          'fast',
          'fast-medium',
          'medium-fast',
          'medium',
          'offbreak',
          'legbreak',
          'left-arm-orthodox',
          'left-arm-wrist-spin',
          'slow',
        ]),
      )
      .optional(),
    opponentBattingHand: z.enum(['left', 'right']).optional(),
    opponentBowlingType: z.enum(['pace', 'spin']).optional(),
    opponentBowlingSubType: z
      .array(
        z.enum([
          'fast',
          'fast-medium',
          'medium-fast',
          'medium',
          'offbreak',
          'legbreak',
          'left-arm-orthodox',
          'left-arm-wrist-spin',
          'slow',
        ]),
      )
      .optional(),
    playingRole: z.enum(['batter', 'bowler', 'allrounder', 'wicketkeeper']).optional(),
    playingRoleDetail: z
      .enum([
        'opening_batter',
        'top_order_batter',
        'middle_order_batter',
        'batter',
        'batting_allrounder',
        'bowling_allrounder',
        'allrounder',
        'bowler',
        'wicketkeeper_batter',
        'wicketkeeper',
      ])
      .optional(),
  }),
  sort: StatExplorerSortSchema.optional(),
  pagination: z
    .object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(200).default(50),
    })
    .default({ page: 1, pageSize: 50 }),
});
export type StatExplorerRunRequest = z.infer<typeof StatExplorerRunRequestSchema>;

export type StatExplorerFilterOptions = {
  teams: string[];
  opposition: string[];
  seasons: string[];
  venues: string[];
  cities: string[];
  tossWinners: string[];
  tossDecisions: StatExplorerTossDecisionFilter[];
  innings: Array<1 | 2>;
  availableMetrics: StatExplorerMetric[];
  availableDimensions: StatExplorerDimension[];
  // Player style filter options
  battingHands: string[];
  bowlingTypes: string[];
  bowlingSubTypes: string[];
  playingRoles: string[];
  playingRoleDetails: string[];
};

export type StatExplorerResultRow = Record<string, string | number | null>;
export type StatExplorerResult = {
  data: StatExplorerResultRow[];
  columns: Array<{ key: string; label: string; isNumeric: boolean }>;
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type StatExplorerApiResponse = {
  data: StatExplorerResultRow[];
  columns: Array<{ key: string; label: string; isNumeric: boolean }>;
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
  league: string;
  metadata: {
    availableLeagues: readonly string[];
    reportType: StatExplorerReportType;
    filters: StatExplorerRunRequest['filters'];
    dimensions: StatExplorerDimension[];
    metrics: StatExplorerMetric[];
  };
};

export type StatExplorerOptionsResponse = {
  options: StatExplorerFilterOptions;
  league: string;
};
