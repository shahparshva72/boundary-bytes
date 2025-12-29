'use client';

import { useTeamAverages } from '@/hooks/useStatsAPI';
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

export default function TeamAverages() {
  const { data, isLoading } = useTeamAverages();

  const headers = ['#', 'Team', 'Inn', 'Runs', 'Dis', 'Avg', 'SR', 'Hi', 'Lo'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Team Batting Averages" color="teal" />

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : (
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
              {data?.data && data.data.length > 0 ? (
                data.data.map((team: TeamAveragesData, index: number) => (
                  <DataTableRow key={team.team} index={index}>
                    <DataTableCell>{index + 1}</DataTableCell>
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
                <DataTableEmpty colSpan={9} message="No team averages data available" />
              )}
            </DataTableBody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
