'use client';

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
} from '@/components/ui';
import Pagination from '@/components/ui/Pagination';
import type { StatExplorerResult, StatExplorerSortDirection } from '@/lib/stat-explorer/contracts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  getNextSortState,
  isColumnSortable,
  resolveSortState,
  type StatExplorerSortState,
} from './sorting';

interface StatExplorerResultsProps {
  data: StatExplorerResult & { columns: Array<{ key: string; label: string; isNumeric: boolean }> };
  page: number;
  onPageChange: (page: number) => void;
  sortKey: string | null;
  sortDirection: StatExplorerSortDirection | null;
  onSortChange: (sortState: StatExplorerSortState) => void;
}

export default function StatExplorerResults({
  data,
  page,
  onPageChange,
  sortKey,
  sortDirection,
  onSortChange,
}: StatExplorerResultsProps) {
  const { data: rows, columns, totalRows, totalPages } = data;

  const activeSortState = useMemo(
    () => resolveSortState(columns, sortKey, sortDirection),
    [columns, sortKey, sortDirection],
  );

  const formattedRows = useMemo(() => {
    return rows.map((row) => {
      const formatted: Record<string, string | number | null> = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined) {
          formatted[key] = '-';
        } else if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            formatted[key] = value.toLocaleString();
          } else {
            formatted[key] = value.toFixed(2);
          }
        } else {
          formatted[key] = String(value);
        }
      }
      return formatted;
    });
  }, [rows]);

  const handleSort = (columnKey: string) => {
    if (!isColumnSortable(columnKey)) {
      return;
    }

    const nextSortState = getNextSortState(columnKey, activeSortState);
    onSortChange(nextSortState);
  };

  const lastColumnIndex = columns.length - 1;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <span className="text-sm font-bold text-black">
          {totalRows.toLocaleString()} result{totalRows !== 1 ? 's' : ''}
        </span>
        <span className="text-sm font-bold text-black">
          Page {page} of {totalPages}
        </span>
      </div>

      <DataTable minWidth="600px">
        <DataTableHeader color="teal">
          <tr>
            {columns.map((col, i) => {
              const sortable = isColumnSortable(col.key);
              const activeSortDirection =
                activeSortState?.key === col.key ? activeSortState.direction : null;

              return (
                <DataTableHeadCell
                  key={col.key}
                  isLast={i === lastColumnIndex}
                  aria-sort={
                    activeSortDirection === 'asc'
                      ? 'ascending'
                      : activeSortDirection === 'desc'
                        ? 'descending'
                        : 'none'
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 w-full text-left cursor-pointer"
                      aria-label={`Sort by ${col.label}`}
                    >
                      <span>{col.label}</span>
                      <span className="flex flex-col leading-[0.7] text-[10px]">
                        <ChevronUp
                          className={`size-3 ${
                            activeSortDirection === 'asc' ? 'text-black' : 'text-black/40'
                          }`}
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                        <ChevronDown
                          className={`size-3 ${
                            activeSortDirection === 'desc' ? 'text-black' : 'text-black/40'
                          }`}
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </DataTableHeadCell>
              );
            })}
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {formattedRows.length === 0 ? (
            <DataTableEmpty colSpan={columns.length} message="No results found" />
          ) : (
            formattedRows.map((row, rowIndex) => (
              <DataTableRow key={rowIndex} index={rowIndex}>
                {columns.map((col, colIndex) => (
                  <DataTableCell key={col.key} isLast={colIndex === lastColumnIndex}>
                    {row[col.key]}
                  </DataTableCell>
                ))}
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
