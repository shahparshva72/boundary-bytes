'use client';

import { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

const Select = dynamic(() => import('react-select'), { ssr: false });

const fetchBatters = async () => {
  const { data } = await axios.get('/api/players/batters');
  return data;
};

const fetchBowlers = async () => {
  const { data } = await axios.get('/api/players/bowlers');
  return data;
};

const fetchAdvancedStats = async (overs: number[], player: string, playerType: string) => {
  const params = new URLSearchParams({
    overs: overs.join(','),
    playerType,
    ...(playerType === 'batter' ? { batter: player } : { bowler: player }),
  });
  const { data } = await axios.get(`/api/stats/advanced?${params}`);
  return data;
};

const AdvancedStatsPage = () => {
  const [selectedOvers, setSelectedOvers] = useState<number[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<{ value: string; label: string } | null>(
    null,
  );
  const [playerType, setPlayerType] = useState<'batter' | 'bowler'>('batter');

  const { data: battersData } = useQuery({
    queryKey: ['batters'],
    queryFn: fetchBatters,
  });

  const { data: bowlersData } = useQuery({
    queryKey: ['bowlers'],
    queryFn: fetchBowlers,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch,
  } = useQuery({
    queryKey: ['advancedStats', selectedPlayer, selectedOvers, playerType],
    queryFn: () => fetchAdvancedStats(selectedOvers, selectedPlayer!.value, playerType),
    enabled: false,
    retry: false,
  });

  const handleOverToggle = (over: number) => {
    setSelectedOvers((prev) =>
      prev.includes(over) ? prev.filter((o) => o !== over) : [...prev, over],
    );
  };

  const handlePhaseSelection = (phase: { value: string; label: string } | null) => {
    if (phase?.value === 'powerplay') {
      setSelectedOvers([1, 2, 3, 4, 5, 6]);
    } else if (phase?.value === 'middle') {
      setSelectedOvers([7, 8, 9, 10, 11, 12, 13, 14, 15]);
    } else if (phase?.value === 'death') {
      setSelectedOvers([16, 17, 18, 19, 20]);
    } else {
      setSelectedOvers([]);
    }
  };

  const handleFetchStats = () => {
    if (selectedPlayer && selectedOvers.length > 0) {
      refetch();
    }
  };

  const handlePlayerTypeChange = (type: 'batter' | 'bowler') => {
    setPlayerType(type);
    setSelectedPlayer(null);
  };

  const playerOptions =
    playerType === 'batter'
      ? battersData?.map((batter: string) => ({ value: batter, label: batter })) || []
      : bowlersData?.map((bowler: string) => ({ value: bowler, label: bowler })) || [];

  const phaseOptions = [
    { value: 'custom', label: 'Custom' },
    { value: 'powerplay', label: 'Powerplay (1-6)' },
    { value: 'middle', label: 'Middle (7-15)' },
    { value: 'death', label: 'Death (16-20)' },
  ];

  const customStyles = {
    control: (provided: Record<string, unknown>) => ({
      ...provided,
      border: '4px solid black',
      borderRadius: 0,
      padding: '0.5rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'black',
      },
    }),
    option: (
      provided: Record<string, unknown>,
      state: { isSelected: boolean; isFocused: boolean },
    ) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#FF5E5B' : state.isFocused ? '#FFED66' : 'white',
      color: 'black',
      fontWeight: 'bold',
    }),
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full mx-auto my-8">
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
              ADVANCED STATS
            </h1>
          </div>
        </div>

        <div className="w-full max-w-2xl">
          <div className="mb-4">
            <label className="block text-lg font-bold mb-2 text-black">Player Type</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => handlePlayerTypeChange('batter')}
                className={`p-3 rounded-none border-2 border-black font-bold ${
                  playerType === 'batter' ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
                }`}
              >
                BATTER
              </button>
              <button
                onClick={() => handlePlayerTypeChange('bowler')}
                className={`p-3 rounded-none border-2 border-black font-bold ${
                  playerType === 'bowler' ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
                }`}
              >
                BOWLER
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold mb-2 text-black">
              Select {playerType === 'batter' ? 'Batter' : 'Bowler'}
            </label>
            <Select
              instanceId="advanced-stats-player-select"
              options={playerOptions}
              value={selectedPlayer}
              onChange={(newValue) =>
                setSelectedPlayer(newValue as { value: string; label: string } | null)
              }
              styles={customStyles}
              placeholder={`Select ${playerType === 'batter' ? 'Batter' : 'Bowler'}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-lg font-bold mb-2 text-black">Select Phase</label>
              <Select
                instanceId="advanced-stats-phase-select"
                options={phaseOptions}
                onChange={(newValue) =>
                  handlePhaseSelection(newValue as { value: string; label: string } | null)
                }
                styles={customStyles}
                placeholder="Select Phase"
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-2 text-black">Select Overs</label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((over) => (
                  <button
                    key={over}
                    onClick={() => handleOverToggle(over)}
                    className={`p-2 rounded-none border-2 border-black font-bold ${
                      selectedOvers.includes(over)
                        ? 'bg-[#FFC700] text-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    {over}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleFetchStats}
              disabled={!selectedPlayer || selectedOvers.length === 0 || statsLoading}
              className="w-full bg-[#FFC700] text-black font-bold p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:bg-gray-400 disabled:shadow-none"
            >
              {statsLoading ? 'LOADING...' : 'FETCH STATS'}
            </button>
            <button
              onClick={() => setSelectedOvers([])}
              className="w-full bg-[#FF5E5B] text-black font-bold p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              CLEAR
            </button>
          </div>
        </div>

        {statsError && (
          <div className="text-xl font-bold text-red-500 p-8">Error fetching stats.</div>
        )}

        {statsLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-xl font-bold">Loading stats...</div>
          </div>
        )}

        {stats && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
            {playerType === 'batter' ? (
              <>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Runs Scored</p>
                  <p className="text-3xl font-black text-black">{stats.runsScored}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Balls Faced</p>
                  <p className="text-3xl font-black text-black">{stats.ballsFaced}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Strike Rate</p>
                  <p className="text-3xl font-black text-black">{stats.strikeRate}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Average</p>
                  <p className="text-3xl font-black text-black">{stats.average}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Fours</p>
                  <p className="text-3xl font-black text-black">{stats.fours}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Sixes</p>
                  <p className="text-3xl font-black text-black">{stats.sixes}</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Runs Conceded</p>
                  <p className="text-3xl font-black text-black">{stats.runsConceded}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Wickets</p>
                  <p className="text-3xl font-black text-black">{stats.wickets}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Economy Rate</p>
                  <p className="text-3xl font-black text-black">{stats.economyRate}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Average</p>
                  <p className="text-3xl font-black text-black">{stats.average}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Strike Rate</p>
                  <p className="text-3xl font-black text-black">{stats.strikeRate}</p>
                </div>
                <div className="bg-[#FFC700] p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  <p className="text-lg font-bold text-black">Dot Balls</p>
                  <p className="text-3xl font-black text-black">{stats.dots}</p>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdvancedStatsPage;
