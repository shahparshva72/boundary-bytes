'use client';

import { useBowlingWicketTypes } from '@/hooks/useStatsAPI';
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

interface BowlingWicketTypesData {
  player: string;
  totalWickets: number;
  wicketTypes: {
    caught: number;
    bowled: number;
    lbw: number;
    stumped: number;
    caughtAndBowled: number;
    hitWicket: number;
  };
  matches: number;
}

export default function BowlingWicketTypes() {
  const [currentPage, setCurrentPage] = useQueryState(
    'bowlingWicketTypesPage',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const { data, isLoading } = useBowlingWicketTypes(currentPage);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  const headers = ['#', 'Bowler', 'Tot', 'C', 'B', 'LBW', 'St', 'C&B', 'HW', 'Mat'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Bowling Wicket Types" color="coral" />

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : (
          <>
            <DataTable minWidth="650px">
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
                  data.data.map((bowler: BowlingWicketTypesData, index: number) => (
                    <DataTableRow key={bowler.player} index={index}>
                      <DataTableCell>{(currentPage - 1) * 10 + index + 1}</DataTableCell>
                      <DataTableCell>{bowler.player}</DataTableCell>
                      <DataTableCell>{bowler.totalWickets}</DataTableCell>
                      <DataTableCell>{bowler.wicketTypes.caught}</DataTableCell>
                      <DataTableCell>{bowler.wicketTypes.bowled}</DataTableCell>
                      <DataTableCell>{bowler.wicketTypes.lbw}</DataTableCell>
                      <DataTableCell>{bowler.wicketTypes.stumped}</DataTableCell>
                      <DataTableCell>{bowler.wicketTypes.caughtAndBowled}</DataTableCell>
                      <DataTableCell>{bowler.wicketTypes.hitWicket}</DataTableCell>
                      <DataTableCell isLast>{bowler.matches}</DataTableCell>
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableEmpty colSpan={10} message="No bowling wicket types data available" />
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
