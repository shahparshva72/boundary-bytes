'use client';

import { useRunScorers } from '@/hooks/useStatsAPI';
import { parseAsInteger, useQueryState } from 'nuqs';
import {
  Card,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
  Pagination,
  SectionHeader,
  Spinner,
} from './ui';

interface RunScorerData {
  player: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
  matches: number;
  fours: number;
  sixes: number;
  dotBallPercentage: number;
}

export default function RunScorers() {
  const [currentPage, setCurrentPage] = useQueryState(
    'runScorersPage',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const { data, isLoading } = useRunScorers(currentPage);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  const headers = ['#', 'Player', 'Runs', 'Balls', '4s', '6s', 'Dot %', 'SR', 'Mat'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Leading Run Scorers" color="coral" />

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : (
          <>
            <DataTable minWidth="600px">
              <DataTableHeader color="teal">
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
                  data.data.map((player: RunScorerData, index: number) => (
                    <DataTableRow key={player.player} index={index}>
                      <DataTableCell>{(currentPage - 1) * 10 + index + 1}</DataTableCell>
                      <DataTableCell>{player.player}</DataTableCell>
                      <DataTableCell>{player.runs}</DataTableCell>
                      <DataTableCell>{player.ballsFaced}</DataTableCell>
                      <DataTableCell>{player.fours}</DataTableCell>
                      <DataTableCell>{player.sixes}</DataTableCell>
                      <DataTableCell>{player.dotBallPercentage.toFixed(2)}</DataTableCell>
                      <DataTableCell>{player.strikeRate.toFixed(2)}</DataTableCell>
                      <DataTableCell isLast>{player.matches}</DataTableCell>
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableEmpty colSpan={9} message="No run scorers data available" />
                )}
              </DataTableBody>
            </DataTable>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              skipSize={10}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
