'use client';

import { useBatters, useBowlers } from '@/hooks/usePlayersAPI';
import { useMatchup } from '@/hooks/useStatsAPI';
import { parseAsString, useQueryState } from 'nuqs';
import {
  Button,
  Card,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
  Select,
  Spinner,
} from './ui';
import type { SelectOption } from './ui/Select';

export default function Matchup() {
  const { data: batters, isLoading: battersLoading } = useBatters();
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();

  const [selectedBatterValue, setSelectedBatterValue] = useQueryState(
    'batter',
    parseAsString.withOptions({ clearOnDefault: true }),
  );
  const [selectedBowlerValue, setSelectedBowlerValue] = useQueryState(
    'bowler',
    parseAsString.withOptions({ clearOnDefault: true }),
  );

  const selectedBatter = selectedBatterValue
    ? { value: selectedBatterValue, label: selectedBatterValue }
    : null;
  const selectedBowler = selectedBowlerValue
    ? { value: selectedBowlerValue, label: selectedBowlerValue }
    : null;

  const {
    data: matchupData,
    isLoading: isMatchupLoading,
    error: queryError,
  } = useMatchup(selectedBatter?.value || '', selectedBowler?.value || '');

  const error = queryError ? 'Failed to fetch matchup data.' : null;

  const batterOptions: SelectOption[] =
    batters?.map((batter: string) => ({ value: batter, label: batter })) || [];
  const bowlerOptions: SelectOption[] =
    bowlers?.map((bowler: string) => ({ value: bowler, label: bowler })) || [];

  const handleBatterChange = (newValue: SelectOption | null) => {
    setSelectedBatterValue(newValue?.value || null);
  };

  const handleBowlerChange = (newValue: SelectOption | null) => {
    setSelectedBowlerValue(newValue?.value || null);
  };

  const handleFetchMatchup = () => {
    if (!selectedBatter || !selectedBowler) {
      return;
    }
  };

  const matchupMetrics = matchupData?.data
    ? [
        { metric: 'Runs Scored', value: matchupData.data.runsScored },
        { metric: 'Balls Faced', value: matchupData.data.ballsFaced },
        { metric: 'Dismissals', value: matchupData.data.dismissals },
        { metric: 'Strike Rate', value: matchupData.data.strikeRate },
        { metric: 'Average', value: matchupData.data.average },
      ]
    : [];

  return (
    <div className="flex flex-col gap-2 sm:gap-5 items-center w-full mx-auto my-1 sm:my-4">
      <div className="w-full max-w-2xl flex flex-col gap-2 sm:gap-3 sm:flex-row items-center justify-center">
        <div className="w-full sm:w-1/2">
          <label
            htmlFor="batter-select"
            className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1"
          >
            Batter
          </label>
          <Select
            id="batter-select"
            instanceId="batter-select"
            options={batterOptions}
            value={selectedBatter}
            onChange={handleBatterChange}
            placeholder={battersLoading ? 'Loading Batters...' : 'Select Batter'}
            isLoading={battersLoading}
          />
        </div>
        <div className="w-full sm:w-1/2">
          <label
            htmlFor="bowler-select"
            className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1"
          >
            Bowler
          </label>
          <Select
            id="bowler-select"
            instanceId="bowler-select"
            options={bowlerOptions}
            value={selectedBowler}
            onChange={handleBowlerChange}
            placeholder={bowlersLoading ? 'Loading Bowlers...' : 'Select Bowler'}
            isLoading={bowlersLoading}
          />
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleFetchMatchup}
        disabled={isMatchupLoading || !selectedBatter || !selectedBowler}
        className="font-black text-sm sm:text-base uppercase"
      >
        {isMatchupLoading ? 'Loading...' : 'Get Stats'}
      </Button>

      {error && (
        <Card className="mt-2 sm:mt-8 p-3 sm:p-6">
          <p className="text-sm sm:text-2xl font-bold text-red-600">{error}</p>
        </Card>
      )}

      {isMatchupLoading && (
        <div className="mt-2 sm:mt-8">
          <Spinner size="md" color="#1a202c" />
        </div>
      )}

      {matchupData?.data && (
        <div className="mt-2 sm:mt-8 w-full">
          <Card className="p-2 sm:p-8">
            <h2 className="text-base sm:text-2xl md:text-3xl font-black text-center mb-2 sm:mb-6 text-black">
              {selectedBatter?.label} vs {selectedBowler?.label}
            </h2>
            <DataTable minWidth="300px">
              <DataTableHeader color="teal">
                <tr>
                  <DataTableHeadCell>Metric</DataTableHeadCell>
                  <DataTableHeadCell isLast>Value</DataTableHeadCell>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {matchupMetrics.map((row, index) => (
                  <DataTableRow key={row.metric} index={index}>
                    <DataTableCell>{row.metric}</DataTableCell>
                    <DataTableCell isLast className="text-center font-mono">
                      {row.value}
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </Card>
        </div>
      )}
    </div>
  );
}
