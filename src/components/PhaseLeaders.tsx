'use client';

import Link from 'next/link';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import { useMemo } from 'react';
import { useStatExplorerOptions, useStatExplorerQuery } from '@/hooks/useStatExplorer';
import { slugify } from '@/lib/slugify';
import type {
  StatExplorerMetric,
  StatExplorerRunRequest,
  StatExplorerSortDirection,
} from '@/lib/stat-explorer/contracts';
import { METRIC_LABELS, MIN_BALLS_OPTIONS, PHASE_LABELS } from '@/lib/stat-explorer/registry';
import {
  Card,
  CardContent,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
  MultiSelect,
  Pagination,
  SectionHeader,
  Select,
  Spinner,
} from './ui';
import type { SelectOption } from './ui/Select';

const PAGE_SIZE = 10;

type LeaderType = 'batting' | 'bowling';
type Phase = keyof typeof PHASE_LABELS;

interface LeaderConfig {
  metrics: StatExplorerMetric[];
  rankBy: Array<{ metric: StatExplorerMetric; direction: StatExplorerSortDirection }>;
  defaultMinBalls: number;
  ballsLabel: string;
}

const LEADER_CONFIG: Record<LeaderType, LeaderConfig> = {
  batting: {
    metrics: [
      'runs',
      'ballsFaced',
      'strikeRate',
      'average',
      'boundaryPct',
      'dotBallPct',
      'ballsPerSix',
      'leagueAdjustedStrikeRate',
    ],
    rankBy: [
      { metric: 'strikeRate', direction: 'desc' },
      { metric: 'leagueAdjustedStrikeRate', direction: 'desc' },
      { metric: 'runs', direction: 'desc' },
      { metric: 'boundaryPct', direction: 'desc' },
      { metric: 'ballsPerSix', direction: 'asc' },
      { metric: 'dotBallPct', direction: 'asc' },
    ],
    defaultMinBalls: 100,
    ballsLabel: 'Minimum Balls Faced',
  },
  bowling: {
    metrics: [
      'wickets',
      'ballsBowled',
      'economyRate',
      'dotBallPct',
      'boundaryPct',
      'leagueAdjustedEconomy',
    ],
    rankBy: [
      { metric: 'economyRate', direction: 'asc' },
      { metric: 'leagueAdjustedEconomy', direction: 'asc' },
      { metric: 'wickets', direction: 'desc' },
      { metric: 'dotBallPct', direction: 'desc' },
      { metric: 'boundaryPct', direction: 'asc' },
    ],
    defaultMinBalls: 100,
    ballsLabel: 'Minimum Balls Bowled',
  },
};

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'batting', label: 'Batting' },
  { value: 'bowling', label: 'Bowling' },
];

const PHASE_OPTIONS: SelectOption[] = Object.entries(PHASE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const MIN_BALLS_SELECT_OPTIONS: SelectOption[] = MIN_BALLS_OPTIONS.map((balls) => ({
  value: String(balls),
  label: `${balls}+ balls`,
}));

export default function PhaseLeaders() {
  const [params, setParams] = useQueryStates(
    {
      phaseLeadersType: parseAsStringEnum<LeaderType>(['batting', 'bowling']).withDefault(
        'batting',
      ),
      phaseLeadersPhase: parseAsStringEnum<Phase>(['powerplay', 'middle', 'death']).withDefault(
        'death',
      ),
      phaseLeadersRank: parseAsString,
      phaseLeadersMin: parseAsInteger,
      phaseLeadersSeasons: parseAsArrayOf(parseAsString),
      phaseLeadersPage: parseAsInteger.withDefault(1),
    },
    { clearOnDefault: true },
  );

  const type = params.phaseLeadersType;
  const phase = params.phaseLeadersPhase;
  const page = Math.max(1, params.phaseLeadersPage);
  const config = LEADER_CONFIG[type];
  const rank =
    config.rankBy.find((option) => option.metric === params.phaseLeadersRank) ?? config.rankBy[0];
  const minBalls = MIN_BALLS_OPTIONS.includes(params.phaseLeadersMin ?? -1)
    ? (params.phaseLeadersMin as number)
    : config.defaultMinBalls;
  const seasons = useMemo(() => params.phaseLeadersSeasons ?? [], [params.phaseLeadersSeasons]);

  const request: StatExplorerRunRequest = useMemo(
    () => ({
      reportType: type,
      dimensions: ['player'],
      metrics: config.metrics,
      filters: { phase, minBalls, ...(seasons.length ? { seasons } : {}) },
      sort: { key: rank.metric, direction: rank.direction },
      pagination: { page, pageSize: PAGE_SIZE },
    }),
    [type, config.metrics, phase, minBalls, seasons, rank.metric, rank.direction, page],
  );

  const { data, isLoading, isError, isFetching } = useStatExplorerQuery(request);
  const { data: optionsData } = useStatExplorerOptions(type);

  const seasonOptions = useMemo(
    () => (optionsData?.options.seasons ?? []).map((season) => ({ value: season, label: season })),
    [optionsData],
  );
  const rankOptions = useMemo(
    () =>
      config.rankBy.map((option) => ({
        value: option.metric,
        label: `${METRIC_LABELS[option.metric]} (${option.direction === 'asc' ? 'low' : 'high'})`,
      })),
    [config.rankBy],
  );

  const columns = data?.columns ?? [];
  const rows = data?.data ?? [];
  const rankKey = rank.metric.toLowerCase();

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title={`${PHASE_LABELS[phase]} Leaders`} color="coral" />

        <CardContent className="border-b-2 border-black">
          <p className="mb-3 text-xs font-bold text-black">
            {type === 'batting' ? 'SR vs League' : 'Econ vs League'} compares each player with the
            average for the same league, season and phase. 100 is average;{' '}
            {type === 'batting' ? 'higher' : 'lower'} is better.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">
                Discipline
              </label>
              <Select
                options={TYPE_OPTIONS}
                value={TYPE_OPTIONS.find((option) => option.value === type) ?? null}
                onChange={(val) =>
                  setParams({
                    phaseLeadersType: (val?.value as LeaderType) ?? 'batting',
                    phaseLeadersRank: null,
                    phaseLeadersPage: 1,
                  })
                }
                isSearchable={false}
                instanceId="phase-leaders-type"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Phase</label>
              <Select
                options={PHASE_OPTIONS}
                value={PHASE_OPTIONS.find((option) => option.value === phase) ?? null}
                onChange={(val) =>
                  setParams({
                    phaseLeadersPhase: (val?.value as Phase) ?? 'death',
                    phaseLeadersPage: 1,
                  })
                }
                isSearchable={false}
                instanceId="phase-leaders-phase"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Rank By</label>
              <Select
                options={rankOptions}
                value={rankOptions.find((option) => option.value === rank.metric) ?? null}
                onChange={(val) =>
                  setParams({ phaseLeadersRank: val?.value ?? null, phaseLeadersPage: 1 })
                }
                isSearchable={false}
                instanceId="phase-leaders-rank"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">
                {config.ballsLabel}
              </label>
              <Select
                options={MIN_BALLS_SELECT_OPTIONS}
                value={
                  MIN_BALLS_SELECT_OPTIONS.find((option) => Number(option.value) === minBalls) ??
                  null
                }
                onChange={(val) =>
                  setParams({
                    phaseLeadersMin: val ? Number(val.value) : null,
                    phaseLeadersPage: 1,
                  })
                }
                isSearchable={false}
                instanceId="phase-leaders-min-balls"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Seasons</label>
              <MultiSelect
                options={seasonOptions}
                value={seasons.map((season) => ({ value: season, label: season }))}
                onChange={(vals) =>
                  setParams({
                    phaseLeadersSeasons: vals.length ? vals.map((v) => v.value) : null,
                    phaseLeadersPage: 1,
                  })
                }
                placeholder="All seasons..."
                maxSelections={10}
                instanceId="phase-leaders-seasons"
              />
            </div>
          </div>
        </CardContent>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : isError ? (
          <CardContent className="bg-[#FF5E5B] text-sm font-bold text-black">
            Could not load phase leaders. Try again.
          </CardContent>
        ) : (
          <div className={isFetching ? 'opacity-60' : undefined}>
            <DataTable minWidth="650px">
              <DataTableHeader color="teal">
                <tr>
                  <DataTableHeadCell>#</DataTableHeadCell>
                  {columns.map((column, index) => (
                    <DataTableHeadCell key={column.key} isLast={index === columns.length - 1}>
                      {column.label}
                      {column.key.toLowerCase() === rankKey
                        ? rank.direction === 'asc'
                          ? ' ↑'
                          : ' ↓'
                        : ''}
                    </DataTableHeadCell>
                  ))}
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {rows.length > 0 ? (
                  rows.map((row, rowIndex) => (
                    <DataTableRow key={String(row.player)} index={rowIndex}>
                      <DataTableCell>{(page - 1) * PAGE_SIZE + rowIndex + 1}</DataTableCell>
                      {columns.map((column, index) => (
                        <DataTableCell key={column.key} isLast={index === columns.length - 1}>
                          {column.key === 'player' ? (
                            <Link
                              href={`/players/${slugify(String(row.player))}`}
                              className="font-bold text-black hover:text-black hover:underline"
                            >
                              {row.player}
                            </Link>
                          ) : (
                            (row[column.key] ?? '-')
                          )}
                        </DataTableCell>
                      ))}
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableEmpty
                    colSpan={Math.max(columns.length + 1, 2)}
                    message="No players meet this qualifier. Try a lower minimum."
                  />
                )}
              </DataTableBody>
            </DataTable>
            <Pagination
              currentPage={page}
              totalPages={data?.totalPages ?? 1}
              skipSize={PAGE_SIZE}
              onPageChange={(nextPage: number) => setParams({ phaseLeadersPage: nextPage })}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
