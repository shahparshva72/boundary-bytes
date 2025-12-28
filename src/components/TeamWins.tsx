'use client';

import { useTeamWins } from '@/hooks/useStatsAPI';
import {
  Card,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
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

export default function TeamWins() {
  const { data, isLoading } = useTeamWins();

  const headers = ['#', 'Team', 'Mat', 'W', 'L', 'W 1st', 'W 2nd', 'Win %'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Team Win Stats" color="teal" />

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : (
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
              {data?.data && data.data.length > 0 ? (
                data.data.map((team: TeamWinRow, index: number) => {
                  const winPct =
                    team.matchesPlayed > 0 ? (team.wins / team.matchesPlayed) * 100 : 0;
                  return (
                    <DataTableRow key={team.team} index={index}>
                      <DataTableCell>{index + 1}</DataTableCell>
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
                <DataTableEmpty colSpan={8} message="No team win data available" />
              )}
            </DataTableBody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
