'use client';

import { usePagedRows } from '@/hooks/usePagedRows';
import { useTeamAverages } from '@/hooks/useStatsAPI';
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

interface TeamAveragesData {
  team: string;
  totalInnings: number;
  totalRuns: number;
  totalBalls: number;
  totalDismissals: number;
  battingAverage: number;
  strikeRate: number;
  highestScore: number;
  lowestScore: number;
}

const teamName = (row: TeamAveragesData) => row.team;

export default function TeamAverages() {
  const { data, isLoading } = useTeamAverages();
  const table = usePagedRows<TeamAveragesData>(data?.data, teamName);

  const headers = ['#', 'Team', 'Inn', 'Runs', 'Dis', 'Avg', 'SR', 'Hi', 'Lo'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Team Batting Averages" color="teal" />

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
            <DataTable minWidth="600px">
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
                  table.pageRows.map(({ row: team, rank }, index) => (
                    <DataTableRow key={team.team} index={index}>
                      <DataTableCell>{rank}</DataTableCell>
                      <DataTableCell>{team.team}</DataTableCell>
                      <DataTableCell>{team.totalInnings}</DataTableCell>
                      <DataTableCell>{team.totalRuns}</DataTableCell>
                      <DataTableCell>{team.totalDismissals}</DataTableCell>
                      <DataTableCell>{team.battingAverage.toFixed(2)}</DataTableCell>
                      <DataTableCell>{team.strikeRate.toFixed(2)}</DataTableCell>
                      <DataTableCell>{team.highestScore}</DataTableCell>
                      <DataTableCell isLast>{team.lowestScore}</DataTableCell>
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableEmpty
                    colSpan={9}
                    message={
                      table.search
                        ? 'No teams match your search'
                        : 'No team averages data available'
                    }
                  />
                )}
              </DataTableBody>
            </DataTable>
            {table.isPaged && (
              <Pagination
                currentPage={table.page}
                totalPages={table.totalPages}
                skipSize={table.pageSize}
                onPageChange={table.setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
