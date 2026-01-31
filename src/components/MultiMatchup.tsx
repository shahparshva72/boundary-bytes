'use client';

import { useBatters, useBowlers } from '@/hooks/usePlayersAPI';
import { useMultiMatchup } from '@/hooks/useStatsAPI';
import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
  MultiSelect,
  Select,
  Spinner,
} from './ui';
import type { SelectOption } from './ui/Select';

type MatchupMode = 'batterVsBowlers' | 'bowlerVsBatters';

const modeOptions: SelectOption[] = [
  { value: 'batterVsBowlers', label: 'Batter vs Bowlers' },
  { value: 'bowlerVsBatters', label: 'Bowler vs Batters' },
];

export default function MultiMatchup() {
  const { data: batters, isLoading: battersLoading } = useBatters();
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();

  const [mode, setMode] = useQueryState(
    'matchupMode',
    parseAsStringLiteral(['batterVsBowlers', 'bowlerVsBatters'] as const).withDefault(
      'batterVsBowlers',
    ),
  );

  const [selectedPlayerValue, setSelectedPlayerValue] = useQueryState(
    'player',
    parseAsString.withOptions({ clearOnDefault: true }),
  );

  const [selectedOpponents, setSelectedOpponents] = useQueryState(
    'opponents',
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const selectedPlayer = selectedPlayerValue
    ? { value: selectedPlayerValue, label: selectedPlayerValue }
    : null;

  const selectedOpponentOptions: SelectOption[] = selectedOpponents.map((o) => ({
    value: o,
    label: o,
  }));

  const {
    data: matchupData,
    isLoading: isMatchupLoading,
    error: queryError,
  } = useMultiMatchup(selectedPlayer?.value || '', selectedOpponents, mode);

  const error = queryError ? 'Failed to fetch matchup data.' : null;

  const playerOptions: SelectOption[] =
    mode === 'batterVsBowlers'
      ? batters?.map((b: string) => ({ value: b, label: b })) || []
      : bowlers?.map((b: string) => ({ value: b, label: b })) || [];

  const opponentOptions: SelectOption[] =
    mode === 'batterVsBowlers'
      ? bowlers?.map((b: string) => ({ value: b, label: b })) || []
      : batters?.map((b: string) => ({ value: b, label: b })) || [];

  const handleModeChange = (newValue: SelectOption | null) => {
    if (newValue) {
      setMode(newValue.value as MatchupMode);
      setSelectedPlayerValue(null);
      setSelectedOpponents([]);
    }
  };

  const handlePlayerChange = (newValue: SelectOption | null) => {
    setSelectedPlayerValue(newValue?.value || null);
  };

  const handleOpponentsChange = (newValue: SelectOption[]) => {
    setSelectedOpponents(newValue.map((o) => o.value));
  };

  const isPlayerLoading = mode === 'batterVsBowlers' ? battersLoading : bowlersLoading;
  const isOpponentLoading = mode === 'batterVsBowlers' ? bowlersLoading : battersLoading;

  const playerLabel = mode === 'batterVsBowlers' ? 'Batter' : 'Bowler';
  const opponentLabel = mode === 'batterVsBowlers' ? 'Bowlers' : 'Batters';

  const hasResults = matchupData?.data && matchupData.data.length > 0;
  const noResults = matchupData?.data && matchupData.data.length === 0;

  return (
    <div className="flex flex-col gap-2 sm:gap-5 items-center w-full mx-auto my-1 sm:my-4">
      <div className="w-full max-w-6xl flex flex-col gap-2 sm:gap-3">
        <div className="w-full">
          <label
            htmlFor="mode-select"
            className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1"
          >
            Mode
          </label>
          <Select
            id="mode-select"
            instanceId="mode-select"
            options={modeOptions}
            value={modeOptions.find((o) => o.value === mode) || modeOptions[0]}
            onChange={handleModeChange}
            placeholder="Select Mode"
          />
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <label
              htmlFor="player-select"
              className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1"
            >
              {playerLabel}
            </label>
            <Select
              id="player-select"
              instanceId="player-select"
              options={playerOptions}
              value={selectedPlayer}
              onChange={handlePlayerChange}
              placeholder={isPlayerLoading ? `Loading ${playerLabel}s...` : `Select ${playerLabel}`}
              isLoading={isPlayerLoading}
              isClearable
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label
              htmlFor="opponents-select"
              className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1"
            >
              {opponentLabel} (max 5)
            </label>
            <MultiSelect
              id="opponents-select"
              instanceId="opponents-select"
              options={opponentOptions}
              value={selectedOpponentOptions}
              onChange={handleOpponentsChange}
              placeholder={
                isOpponentLoading ? `Loading ${opponentLabel}...` : `Select ${opponentLabel}`
              }
              isLoading={isOpponentLoading}
              maxSelections={5}
            />
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        disabled={isMatchupLoading || !selectedPlayer || selectedOpponents.length === 0}
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

      {/* Results */}
      {hasResults && (
        <div className="w-full max-w-6xl mt-2 sm:mt-8">
          <Card variant="elevated">
            <CardHeader color="teal">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-base sm:text-lg md:text-xl font-black text-black uppercase tracking-wide">
                  {selectedPlayer?.label}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="black" size="md">
                    vs {matchupData.data.length} {mode === 'batterVsBowlers' ? 'Bowler' : 'Batter'}
                    {matchupData.data.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* Combined Stats Summary */}
            {matchupData.combined && matchupData.data.length > 1 && (
              <div className="bg-[#FFED66] border-b-2 border-black p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Badge variant="black" size="sm">
                    COMBINED TOTALS
                  </Badge>
                </div>
                {mode === 'batterVsBowlers' ? (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                    <StatBox label="Runs" value={matchupData.combined.runsScored} highlight />
                    <StatBox label="Balls" value={matchupData.combined.ballsFaced} />
                    <StatBox label="Outs" value={matchupData.combined.dismissals} />
                    <StatBox label="SR" value={matchupData.combined.strikeRate} highlight />
                    <StatBox label="Avg" value={matchupData.combined.average} />
                    <StatBox label="4s" value={matchupData.combined.fours} />
                    <StatBox label="6s" value={matchupData.combined.sixes} />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
                    <StatBox label="Wkts" value={matchupData.combined.dismissals} highlight />
                    <StatBox label="Runs" value={matchupData.combined.runsScored} />
                    <StatBox label="Balls" value={matchupData.combined.ballsFaced} />
                    <StatBox label="Econ" value={matchupData.combined.economyRate} highlight />
                    <StatBox label="Avg" value={matchupData.combined.average} />
                    <StatBox label="Dots" value={matchupData.combined.dotBalls} />
                    <StatBox label="4s" value={matchupData.combined.fours} />
                    <StatBox label="6s" value={matchupData.combined.sixes} />
                  </div>
                )}
              </div>
            )}

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <DataTable minWidth="600px">
                  <DataTableHeader color="coral">
                    {mode === 'batterVsBowlers' ? (
                      <tr>
                        <DataTableHeadCell>Bowler</DataTableHeadCell>
                        <DataTableHeadCell>Runs</DataTableHeadCell>
                        <DataTableHeadCell>Balls</DataTableHeadCell>
                        <DataTableHeadCell>Outs</DataTableHeadCell>
                        <DataTableHeadCell>SR</DataTableHeadCell>
                        <DataTableHeadCell>Avg</DataTableHeadCell>
                        <DataTableHeadCell>4s</DataTableHeadCell>
                        <DataTableHeadCell isLast>6s</DataTableHeadCell>
                      </tr>
                    ) : (
                      <tr>
                        <DataTableHeadCell>Batter</DataTableHeadCell>
                        <DataTableHeadCell>Wkts</DataTableHeadCell>
                        <DataTableHeadCell>Runs</DataTableHeadCell>
                        <DataTableHeadCell>Balls</DataTableHeadCell>
                        <DataTableHeadCell>Econ</DataTableHeadCell>
                        <DataTableHeadCell>Avg</DataTableHeadCell>
                        <DataTableHeadCell>Dots</DataTableHeadCell>
                        <DataTableHeadCell isLast>4s/6s</DataTableHeadCell>
                      </tr>
                    )}
                  </DataTableHeader>
                  <DataTableBody>
                    {matchupData.data.map(
                      (
                        row: {
                          opponent: string;
                          runsScored: number;
                          ballsFaced: number;
                          dismissals: number;
                          strikeRate: number;
                          economyRate: number;
                          average: number;
                          fours: number;
                          sixes: number;
                          dotBalls: number;
                        },
                        index: number,
                      ) =>
                        mode === 'batterVsBowlers' ? (
                          <DataTableRow key={row.opponent} index={index}>
                            <DataTableCell className="font-bold">{row.opponent}</DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.runsScored}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.ballsFaced}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.dismissals}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.strikeRate}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.average}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.fours}
                            </DataTableCell>
                            <DataTableCell isLast className="text-center font-mono">
                              {row.sixes}
                            </DataTableCell>
                          </DataTableRow>
                        ) : (
                          <DataTableRow key={row.opponent} index={index}>
                            <DataTableCell className="font-bold">{row.opponent}</DataTableCell>
                            <DataTableCell className="text-center font-mono font-bold bg-[#4ECDC4]/20">
                              {row.dismissals}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.runsScored}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.ballsFaced}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.economyRate}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.average}
                            </DataTableCell>
                            <DataTableCell className="text-center font-mono">
                              {row.dotBalls}
                            </DataTableCell>
                            <DataTableCell isLast className="text-center font-mono">
                              {row.fours}/{row.sixes}
                            </DataTableCell>
                          </DataTableRow>
                        ),
                    )}
                  </DataTableBody>
                </DataTable>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {noResults && (
        <Card className="mt-2 sm:mt-8 p-3 sm:p-6">
          <p className="text-sm sm:text-lg font-bold text-gray-600 text-center">
            No matchup data found for the selected players.
          </p>
        </Card>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-2 sm:p-3 border-2 border-black text-center ${highlight ? 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white/50'}`}
    >
      <div className="text-[10px] sm:text-xs font-bold text-black/60 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="text-base sm:text-xl font-black text-black font-mono">{value}</div>
    </div>
  );
}
