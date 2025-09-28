'use client';

import { useQueryState } from 'nuqs';
import { parseAsString } from 'nuqs';
import { useMatchup } from '@/hooks/useStatsAPI';
import { MoonLoader } from 'react-spinners';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface MatchupProps {
  batters: string[];
  bowlers: string[];
}

export default function Matchup({ batters, bowlers }: MatchupProps) {
  const [selectedBatterValue, setSelectedBatterValue] = useQueryState(
    'batter',
    parseAsString.withOptions({ clearOnDefault: true }),
  );
  const [selectedBowlerValue, setSelectedBowlerValue] = useQueryState(
    'bowler',
    parseAsString.withOptions({ clearOnDefault: true }),
  );

  // Convert string values back to select options
  const selectedBatter = selectedBatterValue
    ? { value: selectedBatterValue, label: selectedBatterValue }
    : null;
  const selectedBowler = selectedBowlerValue
    ? { value: selectedBowlerValue, label: selectedBowlerValue }
    : null;

  const {
    data: matchupData,
    isLoading,
    error: queryError,
  } = useMatchup(selectedBatter?.value || '', selectedBowler?.value || '');

  const error = queryError ? 'Failed to fetch matchup data.' : null;

  const batterOptions = batters.map((batter) => ({ value: batter, label: batter }));
  const bowlerOptions = bowlers.map((bowler) => ({ value: bowler, label: bowler }));

  const handleBatterChange = (newValue: unknown) => {
    const selected = newValue as { value: string; label: string } | null;
    setSelectedBatterValue(selected?.value || null);
  };

  const handleBowlerChange = (newValue: unknown) => {
    const selected = newValue as { value: string; label: string } | null;
    setSelectedBowlerValue(selected?.value || null);
  };

  const handleFetchMatchup = () => {
    if (!selectedBatter || !selectedBowler) {
      return;
    }
  };

  const customStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: (provided: any) => ({
      ...provided,
      border: '4px solid black',
      borderRadius: 0,
      padding: '0.5rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'black',
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: (provided: any, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#FF5E5B' : state.isFocused ? '#FFED66' : 'white',
      color: 'black',
      fontWeight: 'bold',
    }),
  };

  return (
    <div className="flex flex-col gap-[40px] items-center w-full  mx-auto my-8">
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-6 items-center justify-center">
        <div className="w-full md:w-1/2">
          <label htmlFor="batter-select" className="block text-lg font-bold text-black mb-2">
            Batter
          </label>
          <Select
            id="batter-select"
            instanceId="batter-select"
            options={batterOptions}
            value={selectedBatter}
            onChange={handleBatterChange}
            styles={customStyles}
            placeholder="Select Batter"
          />
        </div>
        <div className="w-full md:w-1/2">
          <label htmlFor="bowler-select" className="block text-lg font-bold text-black mb-2">
            Bowler
          </label>
          <Select
            id="bowler-select"
            instanceId="bowler-select"
            options={bowlerOptions}
            value={selectedBowler}
            onChange={handleBowlerChange}
            styles={customStyles}
            placeholder="Select Bowler"
          />
        </div>
      </div>

      <button
        onClick={handleFetchMatchup}
        className="px-8 py-4 font-black text-2xl text-black bg-[#FFED66] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
        disabled={isLoading || !selectedBatter || !selectedBowler}
      >
        {isLoading ? 'Loading...' : 'Get Stats'}
      </button>

      {error && (
        <div className="mt-8 text-2xl font-bold text-red-600 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-8">
          <MoonLoader color="#1a202c" size={48} />
        </div>
      )}

      {matchupData?.data && (
        <div className="mt-8 w-full ">
          <div className="bg-white p-8 rounded-none border-4 border-black">
            <h2 className="text-3xl font-black text-center mb-6 text-black">
              {selectedBatter?.label} vs {selectedBowler?.label}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-4 border-black">
                <thead>
                  <tr className="bg-[#4ECDC4]">
                    <th className="p-4 font-black text-lg border-4 border-black text-black">
                      Metric
                    </th>
                    <th className="p-4 font-black text-lg border-4 border-black text-black">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="p-4 font-bold text-lg border-4 border-black text-black">
                      Runs Scored
                    </td>
                    <td className="p-4 font-mono text-lg border-4 border-black text-center text-black">
                      {matchupData.data.runsScored}
                    </td>
                  </tr>
                  <tr className="bg-[#FFED66]">
                    <td className="p-4 font-bold text-lg border-4 border-black text-black">
                      Balls Faced
                    </td>
                    <td className="p-4 font-mono text-lg border-4 border-black text-center text-black">
                      {matchupData.data.ballsFaced}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-4 font-bold text-lg border-4 border-black text-black">
                      Dismissals
                    </td>
                    <td className="p-4 font-mono text-lg border-4 border-black text-center text-black">
                      {matchupData.data.dismissals}
                    </td>
                  </tr>
                  <tr className="bg-[#FFED66]">
                    <td className="p-4 font-bold text-lg border-4 border-black text-black">
                      Strike Rate
                    </td>
                    <td className="p-4 font-mono text-lg border-4 border-black text-center text-black">
                      {matchupData.data.strikeRate}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-4 font-bold text-lg border-4 border-black text-black">
                      Average
                    </td>
                    <td className="p-4 font-mono text-lg border-4 border-black text-center text-black">
                      {matchupData.data.average}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
