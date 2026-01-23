'use client';

import { useBatters, useBowlers } from '@/hooks/usePlayersAPI';
import { usePlayerComparison, useSeasons } from '@/hooks/useStatsAPI';
import type { ComparedPlayer } from '@/types/playerComparison';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import {
  Button,
  Card,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
  MultiSelect,
  Spinner,
} from './ui';
import type { SelectOption } from './ui/Select';

const STAT_TYPES = ['batting', 'bowling', 'both'] as const;

export default function PlayerCompare() {
  const { data: batters, isLoading: battersLoading } = useBatters();
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: seasonsData, isLoading: seasonsLoading } = useSeasons();

  const seasonOptions: SelectOption[] = useMemo(() => {
    if (!seasonsData?.seasons) {
      return [];
    }
    return seasonsData.seasons.map((s: string) => ({ value: s, label: s }));
  }, [seasonsData]);

  const [playersParam, setPlayersParam] = useQueryState(
    'players',
    parseAsString.withOptions({ clearOnDefault: true }),
  );
  const [seasonsParam, setSeasonsParam] = useQueryState(
    'seasons',
    parseAsString.withOptions({ clearOnDefault: true }),
  );

  const selectedSeasons: SelectOption[] = useMemo(() => {
    if (!seasonsParam) {
      return [];
    }
    return seasonsParam.split(',').map((s) => ({ value: s, label: s }));
  }, [seasonsParam]);
  const [statType, setStatType] = useQueryState(
    'statType',
    parseAsStringLiteral(STAT_TYPES).withDefault('both'),
  );

  const selectedPlayers: SelectOption[] = useMemo(() => {
    if (!playersParam) {
      return [];
    }
    return playersParam.split(',').map((p) => ({ value: p, label: p }));
  }, [playersParam]);

  const playerOptions: SelectOption[] = useMemo(() => {
    const allPlayers = new Set<string>();
    if (batters) {
      batters.forEach((b: string) => allPlayers.add(b));
    }
    if (bowlers) {
      bowlers.forEach((b: string) => allPlayers.add(b));
    }
    return Array.from(allPlayers)
      .sort()
      .map((p) => ({ value: p, label: p }));
  }, [batters, bowlers]);

  const filters = useMemo(
    () => ({
      seasons: selectedSeasons.map((s) => s.value),
      statType: statType,
    }),
    [selectedSeasons, statType],
  );

  const {
    data: comparisonData,
    isLoading: isComparing,
    error: queryError,
  } = usePlayerComparison(
    selectedPlayers.map((p) => p.value),
    filters,
  );

  const handlePlayersChange = (newValue: SelectOption[]) => {
    if (newValue.length === 0) {
      setPlayersParam(null);
    } else {
      setPlayersParam(newValue.map((p) => p.value).join(','));
    }
  };

  const handleSeasonsChange = (newValue: SelectOption[]) => {
    if (newValue.length === 0) {
      setSeasonsParam(null);
    } else {
      setSeasonsParam(newValue.map((s) => s.value).join(','));
    }
  };

  const handleStatTypeChange = (type: (typeof STAT_TYPES)[number]) => {
    setStatType(type);
  };

  const error = queryError ? 'Failed to fetch comparison data.' : null;
  const players: ComparedPlayer[] | undefined =
    comparisonData?.data?.players && Array.isArray(comparisonData.data.players)
      ? comparisonData.data.players
      : undefined;

  return (
    <div className="flex flex-col gap-2 sm:gap-3 w-full mx-auto my-1 sm:my-4">
      <div className="flex flex-col gap-2 pb-12 sm:pb-16">
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1">
            Select Players (2-5)
          </label>
          <MultiSelect
            id="players-select"
            instanceId="players-select"
            options={playerOptions}
            value={selectedPlayers}
            onChange={handlePlayersChange}
            placeholder={battersLoading || bowlersLoading ? 'Loading...' : 'Select players...'}
            isLoading={battersLoading || bowlersLoading}
            maxSelections={5}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1">
              Seasons
            </label>
            <MultiSelect
              id="seasons-select"
              instanceId="seasons-select"
              options={seasonOptions}
              value={selectedSeasons}
              onChange={handleSeasonsChange}
              placeholder={seasonsLoading ? 'Loading...' : 'All seasons'}
              isLoading={seasonsLoading}
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label className="block text-xs sm:text-sm font-bold text-black mb-0.5 sm:mb-1">
              Stat Type
            </label>
            <div className="flex gap-1.5">
              {STAT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={statType === type ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => handleStatTypeChange(type)}
                  className="flex-1 capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Card className="p-2 sm:p-3">
          <p className="text-xs sm:text-sm font-bold text-red-600">{error}</p>
        </Card>
      )}

      {isComparing && (
        <div className="flex justify-center py-8">
          <Spinner size="md" color="#1a202c" />
        </div>
      )}

      {players && players.length >= 2 && (
        <div className="flex flex-col gap-6">
          {(statType === 'batting' || statType === 'both') && (
            <Card className="p-2 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-black text-center mb-4 text-black">
                Batting Comparison
              </h2>
              <div className="overflow-x-auto">
                <DataTable minWidth="600px">
                  <DataTableHeader color="teal">
                    <tr>
                      <DataTableHeadCell>Player</DataTableHeadCell>
                      <DataTableHeadCell>Runs</DataTableHeadCell>
                      <DataTableHeadCell>Balls</DataTableHeadCell>
                      <DataTableHeadCell>Inns</DataTableHeadCell>
                      <DataTableHeadCell>Avg</DataTableHeadCell>
                      <DataTableHeadCell>SR</DataTableHeadCell>
                      <DataTableHeadCell>HS</DataTableHeadCell>
                      <DataTableHeadCell>4s</DataTableHeadCell>
                      <DataTableHeadCell>6s</DataTableHeadCell>
                      <DataTableHeadCell isLast>50s/100s</DataTableHeadCell>
                    </tr>
                  </DataTableHeader>
                  <DataTableBody>
                    {players.map((player, index) => (
                      <DataTableRow key={player.name} index={index}>
                        <DataTableCell className="font-bold">{player.name}</DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.runs ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.ballsFaced ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.innings ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.average ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.strikeRate ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.highestScore ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.fours ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.batting?.sixes ?? '-'}
                        </DataTableCell>
                        <DataTableCell isLast className="font-mono">
                          {player.batting
                            ? `${player.batting.fifties}/${player.batting.hundreds}`
                            : '-'}
                        </DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTable>
              </div>
            </Card>
          )}

          {(statType === 'bowling' || statType === 'both') && (
            <Card className="p-2 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-black text-center mb-4 text-black">
                Bowling Comparison
              </h2>
              <div className="overflow-x-auto">
                <DataTable minWidth="600px">
                  <DataTableHeader color="coral">
                    <tr>
                      <DataTableHeadCell>Player</DataTableHeadCell>
                      <DataTableHeadCell>Wkts</DataTableHeadCell>
                      <DataTableHeadCell>Balls</DataTableHeadCell>
                      <DataTableHeadCell>Runs</DataTableHeadCell>
                      <DataTableHeadCell>Inns</DataTableHeadCell>
                      <DataTableHeadCell>Avg</DataTableHeadCell>
                      <DataTableHeadCell>Econ</DataTableHeadCell>
                      <DataTableHeadCell>SR</DataTableHeadCell>
                      <DataTableHeadCell isLast>4w/5w</DataTableHeadCell>
                    </tr>
                  </DataTableHeader>
                  <DataTableBody>
                    {players.map((player, index) => (
                      <DataTableRow key={player.name} index={index}>
                        <DataTableCell className="font-bold">{player.name}</DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.bowling?.wickets ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.bowling?.ballsBowled ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.bowling?.runsConceded ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.bowling?.innings ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.bowling?.average ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.bowling?.economy ?? '-'}
                        </DataTableCell>
                        <DataTableCell className="font-mono">
                          {player.bowling?.strikeRate ?? '-'}
                        </DataTableCell>
                        <DataTableCell isLast className="font-mono">
                          {player.bowling
                            ? `${player.bowling.fourWickets}/${player.bowling.fiveWickets}`
                            : '-'}
                        </DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTable>
              </div>
            </Card>
          )}
        </div>
      )}

      {selectedPlayers.length > 0 && selectedPlayers.length < 2 && (
        <Card className="p-4 sm:p-6">
          <p className="text-center text-gray-600 font-medium">
            Select at least 2 players to compare
          </p>
        </Card>
      )}
    </div>
  );
}
