'use client';

import { Card, CardContent, CardHeader, MultiSelect } from '@/components/ui';
import type { SelectOption } from '@/components/ui/Select';
import type {
  StatExplorerFilterOptions,
  StatExplorerReportType,
} from '@/lib/stat-explorer/contracts';
import { DIMENSION_LABELS, METRIC_LABELS } from '@/lib/stat-explorer/registry';
import { useMemo } from 'react';

interface StatExplorerFiltersProps {
  reportType: StatExplorerReportType;
  options: StatExplorerFilterOptions;
  dimensions: string[];
  metrics: string[];
  filters: {
    teams?: string[];
    opposition?: string[];
    seasons?: string[];
    venues?: string[];
    cities?: string[];
    tossWinners?: string[];
    tossDecisions?: Array<'bat' | 'field'>;
    innings?: Array<1 | 2>;
  };
  onDimensionsChange: (dims: string[]) => void;
  onMetricsChange: (metrics: string[]) => void;
  onFiltersChange: (filters: StatExplorerFiltersProps['filters']) => void;
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

  const updateFilter = <K extends keyof StatExplorerFiltersProps['filters']>(
    key: K,
    value: StatExplorerFiltersProps['filters'][K],
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

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
    </div>
  );
}
