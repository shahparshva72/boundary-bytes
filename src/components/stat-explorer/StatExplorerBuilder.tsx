'use client';

import { Badge, Button, Card, CardContent, SectionHeader, Spinner } from '@/components/ui';
import { useStatExplorerOptions, useStatExplorerQuery } from '@/hooks/useStatExplorer';
import type {
  StatExplorerReportType,
  StatExplorerRunRequest,
  StatExplorerSortDirection,
} from '@/lib/stat-explorer/contracts';
import {
  DEFAULT_DIMENSIONS,
  DEFAULT_METRICS,
  REPORT_TYPE_LABELS,
} from '@/lib/stat-explorer/registry';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import StatExplorerFilters from './StatExplorerFilters';
import StatExplorerResults from './StatExplorerResults';
import type { StatExplorerSortState } from './sorting';

const REPORT_TYPES: StatExplorerReportType[] = ['batting', 'bowling', 'team', 'match'];
const PAGE_SIZE = 50;

export default function StatExplorerBuilder() {
  const [reportType, setReportType] = useQueryState(
    'reportType',
    parseAsStringEnum<StatExplorerReportType>(['batting', 'bowling', 'team', 'match']).withDefault(
      'batting',
    ),
  );

  const [dimensionsParam, setDimensions] = useQueryState(
    'dimensions',
    parseAsArrayOf(parseAsString),
  );
  const dimensions = dimensionsParam ?? DEFAULT_DIMENSIONS[reportType];

  const [metricsParam, setMetrics] = useQueryState('metrics', parseAsArrayOf(parseAsString));
  const metrics = metricsParam ?? DEFAULT_METRICS[reportType];

  const [filters, setFilters] = useQueryStates({
    teams: parseAsArrayOf(parseAsString),
    opposition: parseAsArrayOf(parseAsString),
    seasons: parseAsArrayOf(parseAsString),
    venues: parseAsArrayOf(parseAsString),
    cities: parseAsArrayOf(parseAsString),
    tossWinners: parseAsArrayOf(parseAsString),
    tossDecisions: parseAsArrayOf(parseAsStringEnum<'bat' | 'field'>(['bat', 'field'])),
    innings: parseAsArrayOf(parseAsInteger),
    battingHand: parseAsString,
    bowlingType: parseAsString,
    bowlingSubType: parseAsArrayOf(parseAsString),
    opponentBattingHand: parseAsString,
    opponentBowlingType: parseAsString,
    opponentBowlingSubType: parseAsArrayOf(parseAsString),
    playingRole: parseAsString,
    playingRoleDetail: parseAsString,
  });

  const cleanFilters: StatExplorerRunRequest['filters'] = useMemo(() => {
    const f: StatExplorerRunRequest['filters'] = {};
    if (filters.teams?.length) {
      f.teams = filters.teams;
    }
    if (filters.opposition?.length) {
      f.opposition = filters.opposition;
    }
    if (filters.seasons?.length) {
      f.seasons = filters.seasons;
    }
    if (filters.venues?.length) {
      f.venues = filters.venues;
    }
    if (filters.cities?.length) {
      f.cities = filters.cities;
    }
    if (filters.tossWinners?.length) {
      f.tossWinners = filters.tossWinners;
    }
    if (filters.tossDecisions?.length) {
      f.tossDecisions = filters.tossDecisions as Array<'bat' | 'field'>;
    }
    if (filters.innings?.length) {
      f.innings = filters.innings as Array<1 | 2>;
    }
    if (filters.battingHand) {
      f.battingHand = filters.battingHand as 'left' | 'right';
    }
    if (filters.bowlingType) {
      f.bowlingType = filters.bowlingType as 'pace' | 'spin';
    }
    if (filters.bowlingSubType?.length) {
      f.bowlingSubType =
        filters.bowlingSubType as StatExplorerRunRequest['filters']['bowlingSubType'];
    }
    if (filters.opponentBattingHand) {
      f.opponentBattingHand = filters.opponentBattingHand as 'left' | 'right';
    }
    if (filters.opponentBowlingType) {
      f.opponentBowlingType = filters.opponentBowlingType as 'pace' | 'spin';
    }
    if (filters.opponentBowlingSubType?.length) {
      f.opponentBowlingSubType =
        filters.opponentBowlingSubType as StatExplorerRunRequest['filters']['opponentBowlingSubType'];
    }
    if (filters.playingRole) {
      f.playingRole = filters.playingRole as StatExplorerRunRequest['filters']['playingRole'];
    }
    if (filters.playingRoleDetail) {
      f.playingRoleDetail =
        filters.playingRoleDetail as StatExplorerRunRequest['filters']['playingRoleDetail'];
    }
    return f;
  }, [filters]);

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [sortParams, setSortParams] = useQueryStates({
    sortBy: parseAsString,
    sortDir: parseAsStringEnum<StatExplorerSortDirection>(['asc', 'desc']),
  });

  const { data: optionsData, isLoading: optionsLoading } = useStatExplorerOptions(reportType);
  const options = optionsData?.options;

  const currentRequest: StatExplorerRunRequest = useMemo(
    () => ({
      reportType,
      dimensions: dimensions as StatExplorerRunRequest['dimensions'],
      metrics: metrics as StatExplorerRunRequest['metrics'],
      filters: cleanFilters,
      sort:
        sortParams.sortBy && sortParams.sortDir
          ? { key: sortParams.sortBy, direction: sortParams.sortDir }
          : undefined,
      pagination: { page, pageSize: PAGE_SIZE },
    }),
    [reportType, dimensions, metrics, cleanFilters, sortParams.sortBy, sortParams.sortDir, page],
  );

  const {
    data: resultsData,
    isLoading: isResultsLoading,
    isError: isResultsError,
    error: resultsError,
    isFetching: isResultsFetching,
  } = useStatExplorerQuery(currentRequest);

  const resetSelections = useCallback(() => {
    setDimensions(null);
    setMetrics(null);
    setFilters({
      teams: null,
      opposition: null,
      seasons: null,
      venues: null,
      cities: null,
      tossWinners: null,
      tossDecisions: null,
      innings: null,
      battingHand: null,
      bowlingType: null,
      bowlingSubType: null,
      opponentBattingHand: null,
      opponentBowlingType: null,
      opponentBowlingSubType: null,
      playingRole: null,
      playingRoleDetail: null,
    });
    setSortParams({ sortBy: null, sortDir: null });
    setPage(1);
  }, [setDimensions, setMetrics, setFilters, setSortParams, setPage]);

  const handleReportTypeChange = useCallback(
    (newType: StatExplorerReportType) => {
      setReportType(newType);
      resetSelections();
    },
    [setReportType, resetSelections],
  );

  const handleDimensionsChange = useCallback(
    (nextDimensions: string[]) => {
      setDimensions(nextDimensions.length ? nextDimensions : null);
      setPage(1);
    },
    [setDimensions, setPage],
  );

  const handleMetricsChange = useCallback(
    (nextMetrics: string[]) => {
      setMetrics(nextMetrics.length ? nextMetrics : null);
      setPage(1);
    },
    [setMetrics, setPage],
  );

  const handleFiltersChange = useCallback(
    (newFilters: StatExplorerRunRequest['filters']) => {
      setFilters({
        teams: newFilters.teams?.length ? newFilters.teams : null,
        opposition: newFilters.opposition?.length ? newFilters.opposition : null,
        seasons: newFilters.seasons?.length ? newFilters.seasons : null,
        venues: newFilters.venues?.length ? newFilters.venues : null,
        cities: newFilters.cities?.length ? newFilters.cities : null,
        tossWinners: newFilters.tossWinners?.length ? newFilters.tossWinners : null,
        tossDecisions: newFilters.tossDecisions?.length ? newFilters.tossDecisions : null,
        innings: newFilters.innings?.length ? newFilters.innings : null,
        battingHand: newFilters.battingHand || null,
        bowlingType: newFilters.bowlingType || null,
        bowlingSubType: newFilters.bowlingSubType?.length ? newFilters.bowlingSubType : null,
        opponentBattingHand: newFilters.opponentBattingHand || null,
        opponentBowlingType: newFilters.opponentBowlingType || null,
        opponentBowlingSubType: newFilters.opponentBowlingSubType?.length
          ? newFilters.opponentBowlingSubType
          : null,
        playingRole: newFilters.playingRole || null,
        playingRoleDetail: newFilters.playingRoleDetail || null,
      });
      setPage(1);
    },
    [setFilters, setPage],
  );

  const handleSortChange = useCallback(
    (nextSortState: StatExplorerSortState) => {
      setSortParams({
        sortBy: nextSortState.key,
        sortDir: nextSortState.direction,
      });
    },
    [setSortParams],
  );

  const activeFilterCount = useMemo(() => {
    const customDimsAndMetrics =
      dimensions.length +
      metrics.length -
      (DEFAULT_DIMENSIONS[reportType].length + DEFAULT_METRICS[reportType].length);

    return customDimsAndMetrics + Object.keys(cleanFilters).length;
  }, [dimensions, metrics, reportType, cleanFilters]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-2 sm:px-4">
      <div className="flex flex-col gap-4">
        <SectionHeader title="Stat Explorer" color="coral" size="md" className="border-2" />

        <Card>
          <CardContent className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-black text-black uppercase mr-2">Report Type:</span>
            {REPORT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleReportTypeChange(type)}
                className={`px-4 py-2 text-xs font-black uppercase border-2 border-black transition-all ${
                  reportType === type
                    ? 'bg-[#FF5E5B] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]'
                    : 'bg-white text-black hover:bg-[#FFED66] hover:translate-y-[-1px]'
                }`}
              >
                {REPORT_TYPE_LABELS[type]}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <Badge variant="coral" className="ml-auto">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardContent>
        </Card>

        {optionsLoading ? (
          <div className="flex justify-center py-12 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Spinner size="lg" />
          </div>
        ) : options ? (
          <StatExplorerFilters
            reportType={reportType}
            options={options}
            dimensions={dimensions}
            metrics={metrics}
            filters={cleanFilters}
            onDimensionsChange={handleDimensionsChange}
            onMetricsChange={handleMetricsChange}
            onFiltersChange={handleFiltersChange}
          />
        ) : null}

        <Card>
          <CardContent className="flex flex-wrap justify-between items-center gap-4 bg-gray-50">
            <div className="text-xs font-black text-gray-500 uppercase tracking-wider hidden sm:block">
              {isResultsFetching ? 'Fetching new results...' : 'Results are updated automatically'}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={resetSelections}
                disabled={optionsLoading}
                variant="outline"
                size="md"
                className="flex-1 sm:flex-none"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {isResultsError && (
          <Card>
            <CardContent className="bg-[#FF5E5B] p-4 text-sm font-bold text-white uppercase tracking-wide">
              {resultsError instanceof Error ? resultsError.message : 'An error occurred'}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="pt-4 border-t-4 border-black border-dashed">
        <SectionHeader title="Results" color="teal" size="sm" className="mb-4 border-2" />
        {isResultsLoading ? (
          <div className="flex justify-center py-12 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Spinner size="lg" />
          </div>
        ) : resultsData ? (
          <StatExplorerResults
            data={resultsData}
            page={page}
            onPageChange={setPage}
            sortKey={sortParams.sortBy}
            sortDirection={sortParams.sortDir}
            onSortChange={handleSortChange}
          />
        ) : null}
      </div>
    </div>
  );
}
