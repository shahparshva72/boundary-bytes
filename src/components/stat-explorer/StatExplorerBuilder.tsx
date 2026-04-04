'use client';

import { Badge, Button, SectionHeader, Spinner } from '@/components/ui';
import { useStatExplorerOptions, useStatExplorerRun } from '@/hooks/useStatExplorer';
import type { StatExplorerReportType, StatExplorerRunRequest } from '@/lib/stat-explorer/contracts';
import {
  DEFAULT_DIMENSIONS,
  DEFAULT_METRICS,
  REPORT_TYPE_LABELS,
} from '@/lib/stat-explorer/registry';
import { useMemo, useState } from 'react';
import StatExplorerFilters from './StatExplorerFilters';
import StatExplorerResults from './StatExplorerResults';

const REPORT_TYPES: StatExplorerReportType[] = ['batting', 'bowling', 'team', 'match'];

export default function StatExplorerBuilder() {
  const [reportType, setReportType] = useState<StatExplorerReportType>('batting');
  const [dimensions, setDimensions] = useState<string[]>(DEFAULT_DIMENSIONS.batting);
  const [metrics, setMetrics] = useState<string[]>(DEFAULT_METRICS.batting);
  const [filters, setFilters] = useState<StatExplorerRunRequest['filters']>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  const { data: optionsData, isLoading: optionsLoading } = useStatExplorerOptions(reportType);
  const runMutation = useStatExplorerRun();

  const options = optionsData?.options;

  const handleReportTypeChange = (newType: StatExplorerReportType) => {
    setReportType(newType);
    setDimensions(DEFAULT_DIMENSIONS[newType]);
    setMetrics(DEFAULT_METRICS[newType]);
    setFilters({});
    setPage(1);
  };

  const handleRunQuery = () => {
    const request: StatExplorerRunRequest = {
      reportType,
      dimensions: dimensions as StatExplorerRunRequest['dimensions'],
      metrics: metrics as StatExplorerRunRequest['metrics'],
      filters,
      pagination: { page, pageSize },
    };
    runMutation.mutate(request);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (runMutation.data) {
      const request: StatExplorerRunRequest = {
        reportType,
        dimensions: dimensions as StatExplorerRunRequest['dimensions'],
        metrics: metrics as StatExplorerRunRequest['metrics'],
        filters,
        pagination: { page: newPage, pageSize },
      };
      runMutation.mutate(request);
    }
  };

  const activeFilterCount = useMemo(() => {
    const customDimsAndMetrics =
      dimensions.length +
      metrics.length -
      (DEFAULT_DIMENSIONS[reportType].length + DEFAULT_METRICS[reportType].length);

    const filterCount = Object.entries(filters).reduce((count, [, value]) => {
      if (Array.isArray(value)) {
        return count + (value.length > 0 ? 1 : 0);
      }
      if (value === undefined || value === null || value === '') {
        return count;
      }
      return count + 1;
    }, 0);

    return customDimsAndMetrics + filterCount;
  }, [dimensions, metrics, reportType, filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <SectionHeader title="Stat Explorer" color="coral" size="md" />

        <div className="flex flex-wrap gap-2 items-center px-1">
          <span className="text-sm font-bold text-black">Report Type:</span>
          {REPORT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleReportTypeChange(type)}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                reportType === type
                  ? 'bg-[#FF5E5B] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-[#FFED66]'
              }`}
            >
              {REPORT_TYPE_LABELS[type]}
            </button>
          ))}
          {activeFilterCount > 0 && (
            <Badge variant="coral" className="ml-2">
              {activeFilterCount} custom
            </Badge>
          )}
        </div>

        {optionsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : options ? (
          <StatExplorerFilters
            reportType={reportType}
            options={options}
            dimensions={dimensions}
            metrics={metrics}
            filters={filters}
            onDimensionsChange={setDimensions}
            onMetricsChange={setMetrics}
            onFiltersChange={setFilters}
          />
        ) : null}

        <div className="flex gap-2 px-1">
          <Button
            onClick={handleRunQuery}
            disabled={optionsLoading || runMutation.isPending}
            variant="danger"
            size="md"
          >
            {runMutation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Running...
              </>
            ) : (
              'Run Query'
            )}
          </Button>
          <Button
            onClick={() => {
              setDimensions(DEFAULT_DIMENSIONS[reportType]);
              setMetrics(DEFAULT_METRICS[reportType]);
              setFilters({});
              setPage(1);
            }}
            disabled={optionsLoading}
            variant="outline"
            size="md"
          >
            Reset
          </Button>
        </div>

        {runMutation.isError && (
          <div className="bg-[#FF5E5B] border-2 border-black p-3 text-sm font-bold text-black">
            {runMutation.error instanceof Error ? runMutation.error.message : 'An error occurred'}
          </div>
        )}
      </div>

      {runMutation.isSuccess && runMutation.data && (
        <StatExplorerResults
          data={runMutation.data}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
