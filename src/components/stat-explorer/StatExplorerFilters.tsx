'use client';

import { Card, CardContent, CardHeader, MultiSelect, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui/Select';
import type {
  StatExplorerFilterOptions,
  StatExplorerReportType,
  StatExplorerRunRequest,
} from '@/lib/stat-explorer/contracts';
import { DIMENSION_LABELS, METRIC_LABELS } from '@/lib/stat-explorer/registry';
import { useMemo } from 'react';

// Label maps for player style filter display
const battingHandLabels: Record<string, string> = {
  right: 'Right Hand',
  left: 'Left Hand',
};

const bowlingTypeLabels: Record<string, string> = {
  pace: 'Pace',
  spin: 'Spin',
};

const bowlingSubTypeLabels: Record<string, string> = {
  fast: 'Fast',
  'fast-medium': 'Fast-Medium',
  'medium-fast': 'Medium-Fast',
  medium: 'Medium',
  offbreak: 'Off Break',
  legbreak: 'Leg Break',
  'left-arm-orthodox': 'Left-arm Orthodox',
  'left-arm-wrist-spin': 'Left-arm Wrist Spin',
  slow: 'Slow',
};

// const playingRoleLabels: Record<string, string> = {
//   batter: 'Batter',
//   bowler: 'Bowler',
//   allrounder: 'Allrounder',
//   wicketkeeper: 'Wicketkeeper',
// };

// const playingRoleDetailLabels: Record<string, string> = {
//   opening_batter: 'Opening Batter',
//   top_order_batter: 'Top Order Batter',
//   middle_order_batter: 'Middle Order Batter',
//   batter: 'Batter',
//   batting_allrounder: 'Batting Allrounder',
//   bowling_allrounder: 'Bowling Allrounder',
//   allrounder: 'Allrounder',
//   bowler: 'Bowler',
//   wicketkeeper_batter: 'Wicketkeeper Batter',
//   wicketkeeper: 'Wicketkeeper',
// };

interface StatExplorerFiltersProps {
  reportType: StatExplorerReportType;
  options: StatExplorerFilterOptions;
  dimensions: string[];
  metrics: string[];
  filters: StatExplorerRunRequest['filters'];
  onDimensionsChange: (dims: string[]) => void;
  onMetricsChange: (metrics: string[]) => void;
  onFiltersChange: (filters: StatExplorerRunRequest['filters']) => void;
}

export default function StatExplorerFilters({
  reportType,
  options,
  dimensions,
  metrics,
  filters,
  onDimensionsChange,
  onMetricsChange,
  onFiltersChange,
}: StatExplorerFiltersProps) {
  const teamOptions: SelectOption[] = useMemo(
    () => options.teams.map((t) => ({ value: t, label: t })),
    [options.teams],
  );

  const seasonOptions: SelectOption[] = useMemo(
    () => options.seasons.map((s) => ({ value: s, label: s })),
    [options.seasons],
  );

  const venueOptions: SelectOption[] = useMemo(
    () => options.venues.map((v) => ({ value: v, label: v })),
    [options.venues],
  );

  const cityOptions: SelectOption[] = useMemo(
    () => options.cities.map((c) => ({ value: c, label: c })),
    [options.cities],
  );

  const oppositionOptions: SelectOption[] = useMemo(
    () => (options.opposition || []).map((o) => ({ value: o, label: o })),
    [options.opposition],
  );

  const tossWinnerOptions: SelectOption[] = useMemo(
    () => options.tossWinners.map((t) => ({ value: t, label: t })),
    [options.tossWinners],
  );

  const tossDecisionOptions: SelectOption[] = useMemo(
    () => options.tossDecisions.map((t) => ({ value: t, label: t.toUpperCase() })),
    [options.tossDecisions],
  );

  const inningsOptions: SelectOption[] = useMemo(
    () => options.innings.map((i) => ({ value: String(i), label: `Innings ${i}` })),
    [options.innings],
  );

  const dimensionOptions: SelectOption[] = useMemo(
    () =>
      options.availableDimensions.map((d) => ({
        value: d,
        label: DIMENSION_LABELS[d],
      })),
    [options.availableDimensions],
  );

  const metricOptions: SelectOption[] = useMemo(
    () =>
      options.availableMetrics.map((m) => ({
        value: m,
        label: METRIC_LABELS[m],
      })),
    [options.availableMetrics],
  );

  const dimensionValues: SelectOption[] = useMemo(
    () =>
      dimensions.map((d) => ({
        value: d,
        label: DIMENSION_LABELS[d as keyof typeof DIMENSION_LABELS] || d,
      })),
    [dimensions],
  );

  const metricValues: SelectOption[] = useMemo(
    () =>
      metrics.map((m) => ({
        value: m,
        label: METRIC_LABELS[m as keyof typeof METRIC_LABELS] || m,
      })),
    [metrics],
  );

  const teamValues = useMemo(
    () => (filters.teams || []).map((v) => ({ value: v, label: v })),
    [filters.teams],
  );

  const oppositionValues = useMemo(
    () => (filters.opposition || []).map((v) => ({ value: v, label: v })),
    [filters.opposition],
  );

  const seasonValues = useMemo(
    () => (filters.seasons || []).map((v) => ({ value: v, label: v })),
    [filters.seasons],
  );

  const venueValues = useMemo(
    () => (filters.venues || []).map((v) => ({ value: v, label: v })),
    [filters.venues],
  );

  const cityValues = useMemo(
    () => (filters.cities || []).map((v) => ({ value: v, label: v })),
    [filters.cities],
  );

  const tossWinnerValues = useMemo(
    () => (filters.tossWinners || []).map((v) => ({ value: v, label: v })),
    [filters.tossWinners],
  );

  const tossDecisionValues = useMemo(
    () => (filters.tossDecisions || []).map((v) => ({ value: v, label: v.toUpperCase() })),
    [filters.tossDecisions],
  );

  const inningsValues = useMemo(
    () => (filters.innings || []).map((v) => ({ value: String(v), label: `Innings ${v}` })),
    [filters.innings],
  );

  const bowlingSubTypeValues = useMemo(
    () =>
      (filters.bowlingSubType || []).map((v) => ({
        value: v,
        label: bowlingSubTypeLabels[v] || v,
      })),
    [filters.bowlingSubType],
  );

  const updateFilter = <K extends keyof StatExplorerRunRequest['filters']>(
    key: K,
    value: StatExplorerRunRequest['filters'][K],
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Player style filter options
  const battingHandOptions: SelectOption[] = useMemo(
    () =>
      (options.battingHands || []).map((v) => ({
        value: v,
        label: battingHandLabels[v] || v,
      })),
    [options.battingHands],
  );

  const bowlingTypeOptions: SelectOption[] = useMemo(
    () =>
      (options.bowlingTypes || []).map((v) => ({
        value: v,
        label: bowlingTypeLabels[v] || v,
      })),
    [options.bowlingTypes],
  );

  const bowlingSubTypeOptions: SelectOption[] = useMemo(
    () =>
      (options.bowlingSubTypes || []).map((v) => ({
        value: v,
        label: bowlingSubTypeLabels[v] || v,
      })),
    [options.bowlingSubTypes],
  );

  // Show player style filters only for batting/bowling reports
  const showPlayerStyleFilters = reportType === 'batting' || reportType === 'bowling';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader color="yellow">
          <h3 className="text-sm font-black text-black uppercase">Report Configuration</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">
                Group By (Dimensions)
              </label>
              <MultiSelect
                options={dimensionOptions}
                value={dimensionValues}
                onChange={(newVals) => onDimensionsChange(newVals.map((v) => v.value))}
                placeholder="Select dimensions..."
                maxSelections={3}
                isSearchable
                instanceId="stat-explorer-dimensions"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">
                Statistics (Metrics)
              </label>
              <MultiSelect
                options={metricOptions}
                value={metricValues}
                onChange={(newVals) => onMetricsChange(newVals.map((v) => v.value))}
                placeholder="Select metrics..."
                maxSelections={8}
                isSearchable
                instanceId="stat-explorer-metrics"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader color="teal">
            <h3 className="text-sm font-black text-black uppercase">Team & Opposition</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Teams</label>
              <MultiSelect
                options={teamOptions}
                value={teamValues}
                onChange={(vals) =>
                  updateFilter(
                    'teams',
                    vals.map((v) => v.value),
                  )
                }
                placeholder="All teams..."
                maxSelections={5}
                isSearchable
                instanceId="stat-explorer-teams"
              />
            </div>

            {reportType !== 'team' && (
              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">
                  Opposition
                </label>
                <MultiSelect
                  options={oppositionOptions}
                  value={oppositionValues}
                  onChange={(vals) =>
                    updateFilter(
                      'opposition',
                      vals.map((v) => v.value),
                    )
                  }
                  placeholder="All opposition..."
                  maxSelections={5}
                  isSearchable
                  instanceId="stat-explorer-opposition"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader color="coral">
            <h3 className="text-sm font-black text-black uppercase">Match Context</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Seasons</label>
              <MultiSelect
                options={seasonOptions}
                value={seasonValues}
                onChange={(vals) =>
                  updateFilter(
                    'seasons',
                    vals.map((v) => v.value),
                  )
                }
                placeholder="All seasons..."
                maxSelections={10}
                isSearchable
                instanceId="stat-explorer-seasons"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Venue</label>
              <MultiSelect
                options={venueOptions}
                value={venueValues}
                onChange={(vals) =>
                  updateFilter(
                    'venues',
                    vals.map((v) => v.value),
                  )
                }
                placeholder="All venues..."
                maxSelections={5}
                isSearchable
                instanceId="stat-explorer-venues"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">City</label>
              <MultiSelect
                options={cityOptions}
                value={cityValues}
                onChange={(vals) =>
                  updateFilter(
                    'cities',
                    vals.map((v) => v.value),
                  )
                }
                placeholder="All cities..."
                maxSelections={5}
                isSearchable
                instanceId="stat-explorer-cities"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader color="gold">
            <h3 className="text-sm font-black text-black uppercase">Game Conditions</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">
                Toss Winner
              </label>
              <MultiSelect
                options={tossWinnerOptions}
                value={tossWinnerValues}
                onChange={(vals) =>
                  updateFilter(
                    'tossWinners',
                    vals.map((v) => v.value),
                  )
                }
                placeholder="Any toss winner..."
                maxSelections={5}
                isSearchable
                instanceId="stat-explorer-toss-winner"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">
                Toss Decision
              </label>
              <MultiSelect
                options={tossDecisionOptions}
                value={tossDecisionValues}
                onChange={(vals) =>
                  updateFilter(
                    'tossDecisions',
                    vals.map((v) => v.value as 'bat' | 'field'),
                  )
                }
                placeholder="Any toss decision..."
                maxSelections={2}
                isSearchable={false}
                instanceId="stat-explorer-toss-decision"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Innings</label>
              <MultiSelect
                options={inningsOptions}
                value={inningsValues}
                onChange={(vals) =>
                  updateFilter(
                    'innings',
                    vals.map((v) => Number(v.value) as 1 | 2),
                  )
                }
                placeholder="Both innings..."
                maxSelections={2}
                isSearchable={false}
                instanceId="stat-explorer-innings"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {showPlayerStyleFilters && (
        <Card>
          <CardHeader color="yellow">
            <h3 className="text-sm font-black text-black uppercase">Player Style</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {reportType === 'batting' && (
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    Batting Hand
                  </label>
                  <Select
                    options={battingHandOptions}
                    value={
                      filters.battingHand
                        ? {
                            value: filters.battingHand!,
                            label: battingHandLabels[filters.battingHand!] || filters.battingHand!,
                          }
                        : null
                    }
                    onChange={(val) =>
                      updateFilter(
                        'battingHand',
                        (val?.value as StatExplorerRunRequest['filters']['battingHand']) ||
                          undefined,
                      )
                    }
                    placeholder="Any hand..."
                    isClearable
                    isSearchable={false}
                    instanceId="stat-explorer-batting-hand"
                  />
                </div>
              )}

              {reportType === 'bowling' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">
                      Bowling Type
                    </label>
                    <Select
                      options={bowlingTypeOptions}
                      value={
                        filters.bowlingType
                          ? {
                              value: filters.bowlingType!,
                              label:
                                bowlingTypeLabels[filters.bowlingType!] || filters.bowlingType!,
                            }
                          : null
                      }
                      onChange={(val) =>
                        updateFilter(
                          'bowlingType',
                          (val?.value as StatExplorerRunRequest['filters']['bowlingType']) ||
                            undefined,
                        )
                      }
                      placeholder="Any type..."
                      isClearable
                      isSearchable={false}
                      instanceId="stat-explorer-bowling-type"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-black text-black uppercase mb-1">
                      Bowling Sub-Type
                    </label>
                    <MultiSelect
                      options={bowlingSubTypeOptions}
                      value={bowlingSubTypeValues}
                      onChange={(vals) =>
                        updateFilter(
                          'bowlingSubType',
                          vals.map(
                            (v) => v.value,
                          ) as StatExplorerRunRequest['filters']['bowlingSubType'],
                        )
                      }
                      placeholder="Any sub-type..."
                      maxSelections={5}
                      isSearchable
                      instanceId="stat-explorer-bowling-sub-type"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
