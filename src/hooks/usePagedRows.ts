import { useMemo, useState } from 'react';

export interface RankedRow<T> {
  row: T;
  rank: number;
}

export function usePagedRows<T>(rows: T[] | undefined, label: (row: T) => string, pageSize = 20) {
  const [search, setSearchValue] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const ranked: RankedRow<T>[] = (rows ?? []).map((row, index) => ({ row, rank: index + 1 }));
    const term = search.trim().toLowerCase();
    return term ? ranked.filter(({ row }) => label(row).toLowerCase().includes(term)) : ranked;
  }, [rows, search, label]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  return {
    search,
    setSearch: (value: string) => {
      setSearchValue(value);
      setPage(1);
    },
    page: currentPage,
    setPage,
    totalPages,
    pageRows: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    total: rows?.length ?? 0,
    isPaged: (rows?.length ?? 0) > pageSize,
    pageSize,
  };
}
