'use client';

import PlayerProgressionChart from '@/components/PlayerProgressionChart';
import { Spinner } from '@/components/ui';
import type { SelectOption } from '@/components/ui/Select';
import { Select } from '@/components/ui/Select';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useBatters } from '@/hooks/usePlayersAPI';
import { usePlayerProgression } from '@/hooks/useStatsAPI';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import Layout from '../components/Layout';

export const dynamic = 'force-dynamic';

export default function PlayerProgressionPage() {
  const { leagueConfig } = useLeagueContext();
  const { data: battersData, isLoading: battersLoading } = useBatters();

  const [selectedPlayerValue, setSelectedPlayerValue] = useQueryState(
    'player',
    parseAsString.withOptions({ clearOnDefault: true }),
  );

  const [inningsFilter, setInningsFilter] = useQueryState(
    'innings',
    parseAsStringLiteral(['1', '2'] as const).withOptions({ clearOnDefault: true }),
  );

  const selectedPlayer = selectedPlayerValue
    ? { value: selectedPlayerValue, label: selectedPlayerValue }
    : null;

  const {
    data: progressionData,
    isLoading: progressionLoading,
    error: progressionError,
  } = usePlayerProgression(selectedPlayer?.value || '', inningsFilter || null);

  const batterOptions: SelectOption[] =
    battersData?.map((batter: string) => ({ value: batter, label: batter })) || [];

  const handlePlayerChange = (newValue: SelectOption | null) => {
    setSelectedPlayerValue(newValue?.value || null);
  };

  const handleInningsChange = (value: '1' | '2' | 'all') => {
    if (value === 'all') {
      setInningsFilter(null);
    } else {
      setInningsFilter(value);
    }
  };

  const isLoading = battersLoading || progressionLoading;
  const isError = !!progressionError;

  const description = leagueConfig
    ? `Track how ${leagueConfig.name} batters approach their innings with strike rate progression through powerplay, middle, and death overs.`
    : 'Track how batters approach their innings with strike rate progression through powerplay, middle, and death overs.';

  return (
    <Layout title="Player Innings Progression" description={description} error={isError}>
      <div className="w-full max-w-6xl px-2 sm:px-4">
        <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-6 space-y-4">
          {/* Player Selection */}
          <div>
            <label className="block text-base sm:text-lg font-bold mb-2 text-black">
              Select Batter
            </label>
            <Select
              instanceId="player-progression-select"
              options={batterOptions}
              value={selectedPlayer}
              onChange={handlePlayerChange}
              placeholder={battersLoading ? 'Loading players...' : 'Select a batter'}
              isLoading={battersLoading}
              isClearable
            />
          </div>

          {/* Innings Filter */}
          <div>
            <label className="block text-base sm:text-lg font-bold mb-2 text-black">
              Filter by Innings
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleInningsChange('all')}
                className={`p-2 sm:p-3 rounded-none border-2 border-black font-bold text-sm sm:text-base transition-all duration-200 hover:bg-yellow-300 ${
                  !inningsFilter ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => handleInningsChange('1')}
                className={`p-2 sm:p-3 rounded-none border-2 border-black font-bold text-sm sm:text-base transition-all duration-200 hover:bg-yellow-300 ${
                  inningsFilter === '1' ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
                }`}
              >
                1ST INNINGS
              </button>
              <button
                onClick={() => handleInningsChange('2')}
                className={`p-2 sm:p-3 rounded-none border-2 border-black font-bold text-sm sm:text-base transition-all duration-200 hover:bg-yellow-300 ${
                  inningsFilter === '2' ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
                }`}
              >
                2ND INNINGS
              </button>
            </div>
          </div>
        </div>

        {/* Chart Display */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Spinner size="md" color="#4F46E5" />
          </div>
        )}

        {!isLoading && progressionData && (
          <div className="w-full">
            {progressionData.data && progressionData.data.length > 0 ? (
              <>
                <PlayerProgressionChart
                  data={progressionData.data}
                  player={progressionData.player}
                />
                <div className="mt-4 p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-sm font-bold text-black">
                    Based on {progressionData.metadata.totalInnings} innings across{' '}
                    {progressionData.metadata.totalMatches} matches
                    {inningsFilter && ` (${inningsFilter === '1' ? '1st' : '2nd'} innings only)`}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full p-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-center font-bold text-black">
                  {selectedPlayer
                    ? `No data available for ${selectedPlayer.label}${
                        inningsFilter ? ` in ${inningsFilter === '1' ? '1st' : '2nd'} innings` : ''
                      }`
                    : 'Please select a batter to view progression'}
                </p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !progressionData && selectedPlayer && (
          <div className="w-full p-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-center font-bold text-black">
              No data available for {selectedPlayer.label}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
