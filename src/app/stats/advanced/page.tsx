'use client';

import { useQuery } from '@tanstack/react-query';
import { useBatters, useBowlers } from '@/hooks/usePlayersAPI';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';
import dynamic from 'next/dynamic';

import Layout from '../components/Layout';
import StatsControls from '../components/StatsControls';
import StatsDisplay from '../components/StatsDisplay';
import { useAdvancedStats } from '../hooks/useAdvancedStats';

const Select = dynamic(() => import('react-select'), { ssr: false });

const AdvancedStatsPage = () => {
  const { state, dispatch } = useAdvancedStats();
  const { selectedOvers, selectedPlayer, playerType } = state;
  const { selectedLeague, leagueConfig } = useLeagueContext();
  const { fetchWithLeague } = useLeagueAPI();

  // Use league-aware hooks that automatically include league parameter
  const { data: battersData, isLoading: battersLoading, isError: battersError } = useBatters();
  const { data: bowlersData, isLoading: bowlersLoading, isError: bowlersError } = useBowlers();

  // Manual advanced stats fetching with league support
  const {
    data: statsResponse,
    isLoading: statsLoading,
    isError: statsError,
    refetch,
  } = useQuery({
    queryKey: ['advancedStats', selectedOvers, selectedPlayer?.value, playerType, selectedLeague],
    queryFn: async () => {
      if (!selectedPlayer || selectedOvers.length === 0) {
        throw new Error('Player and overs are required');
      }

      const params = new URLSearchParams({
        overs: selectedOvers.join(','),
        playerType,
        ...(playerType === 'batter'
          ? { batter: selectedPlayer.value }
          : { bowler: selectedPlayer.value }),
      });

      const response = await fetchWithLeague(`/api/stats/advanced?${params}`);
      if (!response.ok) throw new Error('Failed to fetch advanced stats');
      return response.json();
    },
    enabled: false, // Only fetch when user clicks button
    retry: false,
  });

  // Extract stats data from response
  const stats = statsResponse?.data || null;

  const handleOverToggle = (over: number) => {
    dispatch({ type: 'TOGGLE_OVER', payload: over });
  };

  const handlePhaseSelection = (phase: { value: string; label: string } | null) => {
    dispatch({ type: 'SET_PHASE', payload: phase?.value || null });
  };

  const handleFetchStats = () => {
    if (selectedPlayer && selectedOvers.length > 0) {
      refetch();
    }
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR' });
  };

  const phaseOptions = [
    { value: 'custom', label: 'Custom' },
    { value: 'powerplay', label: 'Powerplay (1-6)' },
    { value: 'middle', label: 'Middle (7-15)' },
    { value: 'death', label: 'Death (16-20)' },
  ];

  // Show loading if data is still being fetched
  const isLoading = battersLoading || bowlersLoading;
  const isError = battersError || bowlersError;

  // Generate dynamic description based on selected league
  const description = leagueConfig
    ? `Get Advanced ${leagueConfig.name} Stats for players performance overwise.`
    : 'Get Advanced Cricket Stats for players performance overwise.';

  return (
    <Layout description={description} error={isError || statsError} loading={isLoading}>
      <StatsControls
        playerType={playerType}
        setPlayerType={dispatch}
        battersData={Array.isArray(battersData) ? battersData : []}
        bowlersData={Array.isArray(bowlersData) ? bowlersData : []}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={dispatch}
        phaseOptions={phaseOptions}
        handlePhaseSelection={handlePhaseSelection}
        selectedOvers={selectedOvers}
        handleOverToggle={handleOverToggle}
        handleFetchStats={handleFetchStats}
        statsLoading={statsLoading}
        handleClear={handleClear}
        SelectComponent={Select}
      />
      {statsError && (
        <div className="w-full max-w-2xl mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold">
          Error loading stats:{' '}
          {typeof statsError === 'string' ? statsError : 'Failed to load advanced stats'}
        </div>
      )}
      <StatsDisplay stats={stats} playerType={playerType} />
    </Layout>
  );
};

export default AdvancedStatsPage;
