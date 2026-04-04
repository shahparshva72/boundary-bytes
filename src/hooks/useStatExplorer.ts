import type {
  StatExplorerFilterOptions,
  StatExplorerReportType,
  StatExplorerResult,
  StatExplorerRunRequest,
} from '@/lib/stat-explorer/contracts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from './useLeagueAPI';

async function fetchStatExplorerOptions(
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  reportType: StatExplorerReportType,
): Promise<{ options: StatExplorerFilterOptions }> {
  const params = new URLSearchParams({ reportType });
  const response = await fetchWithLeague(`/api/stats/stat-explorer/options?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stat explorer options');
  }
  return response.json();
}

async function runStatExplorerQuery(
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  request: StatExplorerRunRequest,
): Promise<StatExplorerResult & { league: string; metadata: Record<string, unknown> }> {
  const response = await fetchWithLeague('/api/stats/stat-explorer/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to run query' }));
    throw new Error(error.error || 'Failed to run stat explorer query');
  }
  return response.json();
}

export function useStatExplorerOptions(reportType: StatExplorerReportType) {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['statExplorerOptions', selectedLeague, reportType],
    queryFn: () => fetchStatExplorerOptions(fetchWithLeague, reportType),
    enabled: !!selectedLeague,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStatExplorerRun() {
  const { fetchWithLeague } = useLeagueAPI();

  return useMutation({
    mutationFn: (request: StatExplorerRunRequest) => runStatExplorerQuery(fetchWithLeague, request),
  });
}
