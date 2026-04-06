import type { StatExplorerResult, StatExplorerSortDirection } from '@/lib/stat-explorer/contracts';

export type StatExplorerColumn = StatExplorerResult['columns'][number];

export type StatExplorerSortState = {
  key: string;
  direction: StatExplorerSortDirection;
};

const NON_SORTABLE_COLUMN_KEYS = new Set(['player', 'team']);

export function isColumnSortable(columnKey: string): boolean {
  return !NON_SORTABLE_COLUMN_KEYS.has(columnKey.toLowerCase());
}

export function resolveSortState(
  columns: StatExplorerColumn[],
  sortKey: string | null,
  sortDirection: StatExplorerSortDirection | null,
): StatExplorerSortState | null {
  if (!sortKey || !sortDirection) {
    return null;
  }

  const normalizedSortKey = sortKey.toLowerCase();
  const matchedColumn = columns.find((column) => column.key.toLowerCase() === normalizedSortKey);
  if (!matchedColumn || !isColumnSortable(matchedColumn.key)) {
    return null;
  }

  return { key: matchedColumn.key, direction: sortDirection };
}

export function getNextSortState(
  columnKey: string,
  currentSortState: StatExplorerSortState | null,
): StatExplorerSortState {
  if (!currentSortState || currentSortState.key !== columnKey) {
    return { key: columnKey, direction: 'desc' };
  }

  return {
    key: columnKey,
    direction: currentSortState.direction === 'desc' ? 'asc' : 'desc',
  };
}
