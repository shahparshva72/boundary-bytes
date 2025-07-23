'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBatters, fetchBowlers } from '@/services/playerService';
import { fetchAdvancedStats } from '@/services/statsService';
import dynamic from 'next/dynamic';

import Layout from '../components/Layout';
import StatsControls from '../components/StatsControls';
import StatsDisplay from '../components/StatsDisplay';
import { useAdvancedStats } from '../hooks/useAdvancedStats';

const Select = dynamic(() => import('react-select'), { ssr: false });

const AdvancedStatsPage = () => {
  const { state, dispatch } = useAdvancedStats();
  const { selectedOvers, selectedPlayer, playerType } = state;

  const { data: battersData } = useQuery({ queryKey: ['batters'], queryFn: fetchBatters });
  const { data: bowlersData } = useQuery({ queryKey: ['bowlers'], queryFn: fetchBowlers });

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

  return (
    <Layout
      description={'Get Advanced WPL Stats for players performance overwise.'}
      error={statsError}
    >
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
      <StatsDisplay stats={stats} playerType={playerType} />
    </Layout>
  );
};

export default AdvancedStatsPage;
