'use client';

import { useRunScorers } from '@/hooks/useStatsAPI';
import { parseAsArrayOf, parseAsInteger, useQueryState } from 'nuqs';
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
  MultiSelect,
  Pagination,
  SectionHeader,
  Spinner,
} from './ui';
import type { SelectOption } from './ui/Select';

const PAGE_SIZE = 10;
const BATTING_POSITION_OPTIONS: SelectOption[] = Array.from({ length: 11 }, (_, index) => {
  const position = index + 1;
  return { value: String(position), label: `No. ${position}` };
});

interface RunScorerData {
  player: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
  matches: number;
  fours: number;
  sixes: number;
  dotBallPercentage: number;
  fifties: number;
  hundreds: number;
}

export default function RunScorers() {
  const [currentPage, setCurrentPage] = useQueryState(
    'runScorersPage',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );
  const [positionsParam, setPositionsParam] = useQueryState(
    'runScorersPositions',
    parseAsArrayOf(parseAsInteger),
  );
  const battingPositions = positionsParam ?? [];
  const battingPositionValues = battingPositions.map((position) => ({
    value: String(position),
    label: `No. ${position}`,
  }));

  const { data, isLoading } = useRunScorers(currentPage, battingPositions);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  const headers = ['#', 'Player', 'Runs', 'Balls', '4s', '6s', '50s', '100s', 'Dot %', 'SR', 'Mat'];

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Leading Run Scorers" color="coral" />

        <CardContent className="border-b-2 border-black">
          <div className="max-w-xs">
            <label className="block text-xs font-black text-black uppercase mb-1">
              Batting Position
            </label>
            <MultiSelect
              options={BATTING_POSITION_OPTIONS}
              value={battingPositionValues}
              onChange={(newValue) => {
                setPositionsParam(newValue.length ? newValue.map((p) => Number(p.value)) : null);
                setCurrentPage(1);
              }}
              placeholder="All positions..."
              maxSelections={11}
              isSearchable={false}
              instanceId="run-scorers-batting-position"
            />
          </div>
        </CardContent>

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
                      <DataTableCell>{(currentPage - 1) * PAGE_SIZE + index + 1}</DataTableCell>
                      <DataTableCell>{player.player}</DataTableCell>
                      <DataTableCell>{player.runs}</DataTableCell>
                      <DataTableCell>{player.ballsFaced}</DataTableCell>
                      <DataTableCell>{player.fours}</DataTableCell>
                      <DataTableCell>{player.sixes}</DataTableCell>
                      <DataTableCell>{player.fifties}</DataTableCell>
                      <DataTableCell>{player.hundreds}</DataTableCell>
                      <DataTableCell>{player.dotBallPercentage.toFixed(2)}</DataTableCell>
                      <DataTableCell>{player.strikeRate.toFixed(2)}</DataTableCell>
                      <DataTableCell isLast>{player.matches}</DataTableCell>
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableEmpty colSpan={11} message="No run scorers data available" />
                )}
              </DataTableBody>
            </DataTable>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              skipSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
