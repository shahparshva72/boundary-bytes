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
import type { StatExplorerResult } from '@/lib/stat-explorer/contracts';
import { useMemo } from 'react';

interface StatExplorerResultsProps {
  data: StatExplorerResult & { columns: Array<{ key: string; label: string; isNumeric: boolean }> };
  page: number;
  onPageChange: (page: number) => void;
}

export default function StatExplorerResults({
  data,
  page,
  onPageChange,
}: StatExplorerResultsProps) {
  const { data: rows, columns, totalRows, totalPages } = data;

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
            {columns.map((col, i) => (
              <DataTableHeadCell key={col.key} isLast={i === lastColumnIndex}>
                {col.label}
              </DataTableHeadCell>
            ))}
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
