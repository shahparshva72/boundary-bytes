'use client';

import { useQuery } from '@tanstack/react-query';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';
import { useBatters, useBowlers } from '@/hooks/usePlayersAPI';

import Layout from '../components/Layout';
import StatsControls from '../components/StatsControls';
import StatsDisplay from '../components/StatsDisplay';

// Over sets that the phase picker produces. A request for exactly one of
// these asks the API for the phase instead, which also covers The Hundred's
// 5-ball sets; any other selection is 6-ball overs.
const PHASE_OVERS: Record<'powerplay' | 'middle' | 'death', string> = {
  powerplay: '1,2,3,4,5,6',
  middle: '7,8,9,10,11,12,13,14,15',
  death: '16,17,18,19,20',
};

const phaseForOvers = (overs: number[]) => {
  const key = [...overs].sort((a, b) => a - b).join(',');
  return (Object.keys(PHASE_OVERS) as (keyof typeof PHASE_OVERS)[]).find(
    (phase) => PHASE_OVERS[phase] === key,
  );
};

const fetchAdvancedStats = async (
  selectedOvers: number[],
  selectedPlayer: string | null,
  playerType: 'batter' | 'bowler',
  fetchWithLeague: (url: string) => Promise<Response>,
) => {
  if (!selectedPlayer || selectedOvers.length === 0) {
    throw new Error('Player and overs are required');
  }

  const phase = phaseForOvers(selectedOvers);
  const params = new URLSearchParams({
    ...(phase ? { phase } : { overs: selectedOvers.join(',') }),
    playerType,
    ...(playerType === 'batter' ? { batter: selectedPlayer } : { bowler: selectedPlayer }),
  });

  const response = await fetchWithLeague(`/api/stats/advanced?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch advanced stats');
  }
  return response.json();
};

const AdvancedStatsPage = () => {
  const [queryState, setQueryState] = useQueryStates({
    overs: parseAsArrayOf(parseAsInteger).withDefault([]),
    player: parseAsString.withOptions({ clearOnDefault: true }),
    playerType: parseAsStringLiteral(['batter', 'bowler'] as const).withDefault('batter'),
  });

  const { overs: selectedOvers, player: selectedPlayerValue, playerType } = queryState;
  const selectedPlayer = selectedPlayerValue
    ? { value: selectedPlayerValue, label: selectedPlayerValue }
    : null;

  const { scopeKey, scopeDescription } = useLeagueContext();
  const { fetchWithLeague } = useLeagueAPI();

  const { data: battersData, isLoading: battersLoading, isError: battersError } = useBatters();
  const { data: bowlersData, isLoading: bowlersLoading, isError: bowlersError } = useBowlers();

  const {
    data: statsResponse,
    isLoading: statsLoading,
    isError: statsError,
    refetch,
  } = useQuery({
    queryKey: ['advancedStats', selectedOvers, selectedPlayer?.value, playerType, scopeKey],
    queryFn: () =>
      fetchAdvancedStats(selectedOvers, selectedPlayer?.value || null, playerType, fetchWithLeague),
    enabled: !!(selectedPlayer?.value && selectedOvers.length > 0),
    retry: false,
  });

  const stats = statsResponse?.data || null;

  const handleOverToggle = (over: number) => {
    setQueryState((prev) => ({
      overs: prev.overs.includes(over)
        ? prev.overs.filter((o: number) => o !== over)
        : [...prev.overs, over].sort((a, b) => a - b),
    }));
  };

  const handlePhaseSelection = (phase: { value: string; label: string } | null) => {
    let newOvers: number[] = [];
    if (phase && phase.value in PHASE_OVERS) {
      newOvers = PHASE_OVERS[phase.value as keyof typeof PHASE_OVERS].split(',').map(Number);
    }
    setQueryState({ overs: newOvers });
  };

  const handleFetchStats = () => {
    if (selectedPlayer && selectedOvers.length > 0) {
      refetch();
    }
  };

  const handleClear = () => {
    setQueryState({ overs: [], player: null });
  };

  const handleSetPlayerType = (type: 'batter' | 'bowler') => {
    setQueryState({ playerType: type, player: null });
  };

  const handleSetSelectedPlayer = (player: { value: string; label: string } | null) => {
    setQueryState({ player: player?.value || null });
  };

  const phaseOptions = [
    { value: 'custom', label: 'Custom' },
    { value: 'powerplay', label: 'Powerplay' },
    { value: 'middle', label: 'Middle overs' },
    { value: 'death', label: 'Death overs' },
  ];

  const getCurrentPhase = () => {
    const phase = phaseForOvers(selectedOvers);
    if (phase) {
      return phaseOptions.find((p) => p.value === phase) || null;
    } else if (selectedOvers.length > 0) {
      return phaseOptions.find((p) => p.value === 'custom') || null;
    }
    return null;
  };

  const selectedPhase = getCurrentPhase();

  const isLoading = battersLoading || bowlersLoading;
  const isError = battersError || bowlersError;

  const description = `Advanced stats for players by over and phase across ${scopeDescription}. Powerplay and death cover The Hundred's 5-ball sets too; specific overs count 6-ball overs.`;

  return (
    <Layout title="Advanced Stats" description={description} error={isError || statsError}>
      <StatsControls
        playerType={playerType}
        setPlayerType={handleSetPlayerType}
        battersData={Array.isArray(battersData) ? battersData : []}
        bowlersData={Array.isArray(bowlersData) ? bowlersData : []}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={handleSetSelectedPlayer}
        phaseOptions={phaseOptions}
        selectedPhase={selectedPhase}
        handlePhaseSelection={handlePhaseSelection}
        selectedOvers={selectedOvers}
        handleOverToggle={handleOverToggle}
        handleFetchStats={handleFetchStats}
        statsLoading={statsLoading}
        handleClear={handleClear}
        isLoading={isLoading}
      />
      {statsError && (
        <div className="w-full max-w-2xl mt-4 p-4 bg-red-100 border-2 border-red-500 text-black font-bold">
          Error loading stats:{' '}
          {typeof statsError === 'string' ? statsError : 'Failed to load advanced stats'}
        </div>
      )}
      <StatsDisplay stats={stats} playerType={playerType} />
    </Layout>
  );
};

export default AdvancedStatsPage;
