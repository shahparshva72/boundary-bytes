import { ComponentType, Dispatch } from 'react';
import { Props as ReactSelectProps } from 'react-select';
import { Action } from '../hooks/useAdvancedStats';

interface StatsControlsProps {
  playerType: 'batter' | 'bowler';
  setPlayerType: Dispatch<Action>;
  battersData: string[];
  bowlersData: string[];
  selectedPlayer: { value: string; label: string } | null;
  setSelectedPlayer: Dispatch<Action>;
  phaseOptions: { value: string; label: string }[];
  handlePhaseSelection: (phase: { value: string; label: string } | null) => void;
  selectedOvers: number[];
  handleOverToggle: (over: number) => void;
  handleFetchStats: () => void;
  statsLoading: boolean;
  handleClear: () => void;
  SelectComponent: ComponentType<ReactSelectProps>;
}

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

const StatsControls = ({
  playerType,
  setPlayerType,
  battersData,
  bowlersData,
  selectedPlayer,
  setSelectedPlayer,
  phaseOptions,
  handlePhaseSelection,
  selectedOvers,
  handleOverToggle,
  handleFetchStats,
  statsLoading,
  handleClear,
  SelectComponent,
}: StatsControlsProps) => {
  const playerOptions =
    playerType === 'batter'
      ? battersData?.map((batter: string) => ({ value: batter, label: batter })) || []
      : bowlersData?.map((bowler: string) => ({ value: bowler, label: bowler })) || [];

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-3 sm:mb-4">
        <label className="block text-base sm:text-lg font-bold mb-2 text-black">Player Type</label>
        <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
          <button
            onClick={() => setPlayerType({ type: 'SET_PLAYER_TYPE', payload: 'batter' })}
            className={`p-2 sm:p-3 rounded-none border-2 border-black font-bold text-sm sm:text-base ${
              playerType === 'batter' ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
            }`}
          >
            BATTER
          </button>
          <button
            onClick={() => setPlayerType({ type: 'SET_PLAYER_TYPE', payload: 'bowler' })}
            className={`p-2 sm:p-3 rounded-none border-2 border-black font-bold text-sm sm:text-base ${
              playerType === 'bowler' ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
            }`}
          >
            BOWLER
          </button>
        </div>
      </div>

      <div className="mb-3 sm:mb-4">
        <label className="block text-base sm:text-lg font-bold mb-2 text-black">
          Select {playerType === 'batter' ? 'Batter' : 'Bowler'}
        </label>
        <SelectComponent
          instanceId="advanced-stats-player-select"
          options={playerOptions}
          value={selectedPlayer}
          onChange={(newValue: unknown) =>
            setSelectedPlayer({
              type: 'SET_SELECTED_PLAYER',
              payload: newValue as { value: string; label: string } | null,
            })
          }
          styles={customStyles}
          placeholder={`Select ${playerType === 'batter' ? 'Batter' : 'Bowler'}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <label className="block text-base sm:text-lg font-bold mb-2 text-black">
            Select Phase
          </label>
          <SelectComponent
            instanceId="advanced-stats-phase-select"
            options={phaseOptions}
            onChange={(newValue: unknown) =>
              handlePhaseSelection(newValue as { value: string; label: string } | null)
            }
            styles={customStyles}
            placeholder="Select Phase"
          />
        </div>
        <div>
          <label className="block text-base sm:text-lg font-bold mb-2 text-black">
            Select Overs
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-5 gap-1 sm:gap-2">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((over) => (
              <button
                key={over}
                onClick={() => handleOverToggle(over)}
                className={`p-1.5 sm:p-2 rounded-none border-2 border-black font-bold text-xs sm:text-sm md:text-base ${
                  selectedOvers.includes(over) ? 'bg-[#FFC700] text-black' : 'bg-white text-black'
                }`}
              >
                {over}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:space-x-0">
        <button
          onClick={handleFetchStats}
          disabled={!selectedPlayer || selectedOvers.length === 0 || statsLoading}
          className="w-full bg-[#FFC700] text-black font-bold p-3 sm:p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:bg-gray-400 disabled:shadow-none text-sm sm:text-base"
        >
          {statsLoading ? 'LOADING...' : 'FETCH STATS'}
        </button>
        <button
          onClick={handleClear}
          className="w-full bg-[#FF5E5B] text-black font-bold p-3 sm:p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};

export default StatsControls;
