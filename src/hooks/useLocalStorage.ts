import { League, LeaguePreference } from '@/types/league';
import { useEffect, useState } from 'react';

const LEAGUE_STORAGE_KEY = 'boundary-bytes-league-preference';
const STORAGE_VERSION = '1.0.0';

export const useLocalStorage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLeaguePreference = (): LeaguePreference | null => {
    if (!isClient || typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(LEAGUE_STORAGE_KEY);
      if (!stored) return null;

      const preference: LeaguePreference = JSON.parse(stored);

      // Validate the stored data
      if (!preference.league || !preference.timestamp || !preference.version) {
        localStorage.removeItem(LEAGUE_STORAGE_KEY);
        return null;
      }

      // Check if it's a valid league
      if (!['WPL', 'IPL', 'BBL'].includes(preference.league)) {
        localStorage.removeItem(LEAGUE_STORAGE_KEY);
        return null;
      }

      return preference;
    } catch (error) {
      console.error('Error reading league preference from localStorage:', error);
      localStorage.removeItem(LEAGUE_STORAGE_KEY);
      return null;
    }
  };

  const setLeaguePreference = (league: League): void => {
    if (!isClient || typeof window === 'undefined') return;

    try {
      const preference: LeaguePreference = {
        league,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
      };

      localStorage.setItem(LEAGUE_STORAGE_KEY, JSON.stringify(preference));
    } catch (error) {
      console.error('Error saving league preference to localStorage:', error);
    }
  };

  const clearLeaguePreference = (): void => {
    if (!isClient || typeof window === 'undefined') return;

    try {
      localStorage.removeItem(LEAGUE_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing league preference from localStorage:', error);
    }
  };

  const isFirstVisit = (): boolean => {
    return getLeaguePreference() === null;
  };

  return {
    getLeaguePreference,
    setLeaguePreference,
    clearLeaguePreference,
    isFirstVisit,
    isClient,
  };
};
