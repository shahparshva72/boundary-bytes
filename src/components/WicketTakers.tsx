'use client';

import { useWicketTakers } from '@/hooks/useStatsAPI';
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

interface WicketTakerData {
  player: string;
  wickets: number;
  runsConceded: number;
  average: number;
  ballsBowled: number;
  economy: number;
  matches: number;
}

export default function WicketTakers() {
  const [currentPage, setCurrentPage] = useQueryState(
    'wicketTakersPage',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const { data, isLoading } = useWicketTakers(currentPage);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  const headers = ['#', 'Player', 'Wkts', 'Runs', 'Avg', 'Balls', 'Econ', 'Mat'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Leading Wicket Takers" color="coral" />

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : (
          <>
            <DataTable minWidth="550px">
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
                  data.data.map((player: WicketTakerData, index: number) => (
                    <DataTableRow key={player.player} index={index}>
                      <DataTableCell>{(currentPage - 1) * 10 + index + 1}</DataTableCell>
                      <DataTableCell>{player.player}</DataTableCell>
                      <DataTableCell>{player.wickets}</DataTableCell>
                      <DataTableCell>{player.runsConceded}</DataTableCell>
                      <DataTableCell>{player.average.toFixed(2)}</DataTableCell>
                      <DataTableCell>{player.ballsBowled}</DataTableCell>
                      <DataTableCell>{player.economy.toFixed(2)}</DataTableCell>
                      <DataTableCell isLast>{player.matches}</DataTableCell>
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableEmpty colSpan={8} message="No wicket takers data available" />
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
