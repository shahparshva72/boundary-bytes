import { prisma } from '@/lib/prisma';
import type { StatExplorerReportType, StatExplorerResult } from '@/lib/stat-explorer/contracts';
import { StatExplorerRunRequestSchema } from '@/lib/stat-explorer/contracts';
import {
  buildStatExplorerQuery,
  convertBigIntRows,
  validateDimensions,
  validateMetrics,
} from '@/lib/stat-explorer/query-builder';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DIMENSION_LABELS: Record<string, string> = {
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
};

const METRIC_LABELS: Record<string, string> = {
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

function buildLowerCaseLabelMap(labels: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(labels).map(([key, label]) => [key.toLowerCase(), label]),
  );
}

const LOWER_DIMENSION_LABELS = buildLowerCaseLabelMap(DIMENSION_LABELS);
const LOWER_METRIC_LABELS = buildLowerCaseLabelMap(METRIC_LABELS);

function buildColumns(dataRows: Record<string, unknown>[]): StatExplorerResult['columns'] {
  const firstRowKeys = dataRows.length > 0 ? Object.keys(dataRows[0]) : [];

  return firstRowKeys.map((key) => {
    const lowerKey = key.toLowerCase();

    return {
      key,
      label: LOWER_DIMENSION_LABELS[lowerKey] || LOWER_METRIC_LABELS[lowerKey] || key,
      isNumeric: LOWER_METRIC_LABELS[lowerKey] !== undefined,
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = StatExplorerRunRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parseResult.error.flatten(),
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    const { reportType, dimensions, metrics, filters, pagination } = parseResult.data;

    validateDimensions(
      reportType as StatExplorerReportType,
      dimensions as Parameters<typeof validateDimensions>[1],
    );
    validateMetrics(
      reportType as StatExplorerReportType,
      metrics as Parameters<typeof validateMetrics>[1],
    );

    const { sql, countSql } = buildStatExplorerQuery(parseResult.data, league);

    const [dataRows, countRows] = await Promise.all([
      prisma.$queryRaw<Record<string, unknown>[]>(sql),
      prisma.$queryRaw<Array<{ total: bigint }>>(countSql),
    ]);

    const convertedData = convertBigIntRows(dataRows);
    const totalRows = countRows.length > 0 ? Number(countRows[0].total) : 0;
    const totalPages = Math.ceil(totalRows / pagination.pageSize);
    const columns = buildColumns(dataRows);

    return NextResponse.json({
      data: convertedData,
      columns,
      totalRows,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages,
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        reportType,
        filters,
        dimensions,
        metrics,
      },
    });
  } catch (error) {
    console.error('Error running stat explorer query:', error);

    if (error instanceof Error && error.message.includes('Invalid league')) {
      return NextResponse.json({ error: error.message, code: 'INVALID_LEAGUE' }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('not allowed')) {
      return NextResponse.json(
        { error: error.message, code: 'INVALID_DIMENSION_OR_METRIC' },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
