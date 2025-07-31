'use client';

import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from './useLeagueAPI';

// Team stats hooks
export const useTeamWins = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamWins', selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague('/api/stats/team-wins');
      if (!response.ok) throw new Error('Failed to fetch team wins');
      return response.json();
    },
    enabled: !!selectedLeague,
  });
};

export const useTeamAverages = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamAverages', selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague('/api/stats/team-averages');
      if (!response.ok) throw new Error('Failed to fetch team averages');
      return response.json();
    },
    enabled: !!selectedLeague,
  });
};

// Player stats hooks
export const useWicketTakers = (page: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['wicketTakers', page, selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague(
        `/api/stats/leading-wicket-takers?page=${page}&limit=10`,
      );
      if (!response.ok) throw new Error('Failed to fetch wicket takers');
      return response.json();
    },
    enabled: !!selectedLeague,
  });
};

export const useRunScorers = (page: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['runScorers', page, selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague(
        `/api/stats/leading-run-scorers?page=${page}&limit=10`,
      );
      if (!response.ok) throw new Error('Failed to fetch run scorers');
      return response.json();
    },
    enabled: !!selectedLeague,
  });
};

export const useBowlingWicketTypes = (page: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['bowlingWicketTypes', page, selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague(
        `/api/stats/bowling-wicket-types?page=${page}&limit=10`,
      );
      if (!response.ok) throw new Error('Failed to fetch bowling wicket types');
      return response.json();
    },
    enabled: !!selectedLeague,
  });
};

// Matchup & advanced stats hooks
export const useMatchup = (batter: string, bowler: string) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['matchup', batter, bowler, selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague(
        `/api/stats/matchup?batter=${encodeURIComponent(batter)}&bowler=${encodeURIComponent(bowler)}`,
      );
      if (!response.ok) throw new Error('Failed to fetch matchup');
      return response.json();
    },
    enabled: !!selectedLeague && !!batter && !!bowler,
  });
};

export const useAdvancedStats = (overs: number[], player: string, playerType: string) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['advancedStats', overs, player, playerType, selectedLeague],
    queryFn: async () => {
      const params = new URLSearchParams({
        overs: overs.join(','),
        playerType,
        ...(playerType === 'batter' ? { batter: player } : { bowler: player }),
      });
      const response = await fetchWithLeague(`/api/stats/advanced?${params}`);
      if (!response.ok) throw new Error('Failed to fetch advanced stats');
      return response.json();
    },
    enabled: !!selectedLeague && !!player && overs.length > 0,
  });
};

// Fall of wickets hook
export const useFallOfWickets = (matchId: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['fallOfWickets', matchId, selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague(`/api/stats/fall-of-wickets/${matchId}`);
      if (!response.ok) throw new Error('Failed to fetch fall of wickets');
      return response.json();
    },
    enabled: !!selectedLeague && !!matchId,
  });
};
