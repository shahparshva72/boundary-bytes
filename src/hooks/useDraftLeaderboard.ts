import { useQuery } from '@tanstack/react-query';
import { getDeviceId } from '@/lib/games/deviceId';
import { fetchDraftLeaderboard } from '@/services/gamesService';
import { useLeagueAPI } from './useLeagueAPI';

export function useDraftLeaderboard(date: string, enabled: boolean) {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['draft-leaderboard', selectedLeague, date],
    queryFn: () => {
      const deviceId = getDeviceId();
      if (!deviceId) {
        throw new Error('Device ID unavailable');
      }
      return fetchDraftLeaderboard(fetchWithLeague, date, deviceId);
    },
    enabled: enabled && selectedLeague != null && getDeviceId() !== '',
    staleTime: 60_000,
    retry: false,
  });
}
