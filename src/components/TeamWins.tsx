'use client';

import { usePagedRows } from '@/hooks/usePagedRows';
import { useTeamWins } from '@/hooks/useStatsAPI';
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
  Input,
  Pagination,
  SectionHeader,
  Spinner,
} from './ui';

interface TeamWinRow {
  team: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winsBattingFirst: number;
  winsBattingSecond: number;
}

const teamName = (row: TeamWinRow) => row.team;

export default function TeamWins() {
  const { data, isLoading } = useTeamWins();
  const table = usePagedRows<TeamWinRow>(data?.data, teamName);

  const headers = ['#', 'Team', 'Mat', 'W', 'L', 'W 1st', 'W 2nd', 'Win %'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Team Win Stats" color="teal" />

        {table.isPaged && (
          <CardContent className="border-b-2 border-black">
            <label className="block max-w-xs">
              <span className="block text-xs font-black text-black uppercase mb-1">
                Find a team ({table.total} teams)
              </span>
              <Input
                type="search"
                value={table.search}
                onChange={(event) => table.setSearch(event.target.value)}
                placeholder="Team name"
              />
            </label>
          </CardContent>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : (
          <>
            <DataTable minWidth="550px">
              <DataTableHeader color="gold">
                <tr>
                  {headers.map((header, idx) => (
                    <DataTableHeadCell key={header} isLast={idx === headers.length - 1}>
                      {header}
                    </DataTableHeadCell>
                  ))}
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {table.pageRows.length > 0 ? (
                  table.pageRows.map(({ row: team, rank }, index) => {
                    const winPct =
                      team.matchesPlayed > 0 ? (team.wins / team.matchesPlayed) * 100 : 0;
                    return (
                      <DataTableRow key={team.team} index={index}>
                        <DataTableCell>{rank}</DataTableCell>
                        <DataTableCell>{team.team}</DataTableCell>
                        <DataTableCell>{team.matchesPlayed}</DataTableCell>
                        <DataTableCell>{team.wins}</DataTableCell>
                        <DataTableCell>{team.losses}</DataTableCell>
                        <DataTableCell>{team.winsBattingFirst}</DataTableCell>
                        <DataTableCell>{team.winsBattingSecond}</DataTableCell>
                        <DataTableCell isLast>{winPct.toFixed(2)}</DataTableCell>
                      </DataTableRow>
                    );
                  })
                ) : (
                  <DataTableEmpty
                    colSpan={8}
                    message={
                      table.search ? 'No teams match your search' : 'No team win data available'
                    }
                  />
                )}
              </DataTableBody>
            </DataTable>
            {table.totalPages > 1 && (
              <Pagination
                currentPage={table.page}
                totalPages={table.totalPages}
                skipSize={5}
                onPageChange={table.setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
