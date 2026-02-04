'use client';

import RunRateTrendChart from '@/components/RunRateTrendChart';
import TeamRunRateProgressionChart from '@/components/TeamRunRateProgressionChart';
import { useLeagueContext } from '@/contexts/LeagueContext';
import {
  useRunRateTrend,
  useSeasons,
  useTeamAverages,
  useTeamRunRateProgression,
} from '@/hooks/useStatsAPI';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { Card, Select, Spinner } from './ui';
import type { SelectOption } from './ui/Select';

export default function TeamRunRateTab() {
  const { leagueConfig } = useLeagueContext();
  const { data: teamsData, isLoading: teamsLoading } = useTeamAverages();
  const { data: seasonsData, isLoading: seasonsLoading } = useSeasons();

  const [selectedTeamValue, setSelectedTeamValue] = useQueryState(
    'rrTeam',
    parseAsString.withOptions({ clearOnDefault: true }),
  );
  const [selectedSeasonValue, setSelectedSeasonValue] = useQueryState(
    'rrSeason',
    parseAsString.withOptions({ clearOnDefault: true }),
  );

  const teamOptions: SelectOption[] = useMemo(() => {
    if (!teamsData?.data) {
      return [];
    }
    return teamsData.data.map((t: { team: string }) => ({ value: t.team, label: t.team }));
  }, [teamsData]);

  const seasonOptions: SelectOption[] = useMemo(() => {
    if (!seasonsData?.seasons) {
      return [];
    }
    return seasonsData.seasons.map((s: string) => ({ value: s, label: s }));
  }, [seasonsData]);

  const selectedTeam = selectedTeamValue
    ? { value: selectedTeamValue, label: selectedTeamValue }
    : null;
  const selectedSeason = selectedSeasonValue
    ? { value: selectedSeasonValue, label: selectedSeasonValue }
    : null;

  const {
    data: progressionData,
    isLoading: progressionLoading,
    error: progressionError,
  } = useTeamRunRateProgression(selectedTeam?.value || '', selectedSeason?.value || '');

  const {
    data: trendData,
    isLoading: trendLoading,
    error: trendError,
  } = useRunRateTrend(selectedTeam?.value || null);

  const handleTeamChange = (newValue: SelectOption | null) => {
    setSelectedTeamValue(newValue?.value || null);
  };

  const handleSeasonChange = (newValue: SelectOption | null) => {
    setSelectedSeasonValue(newValue?.value || null);
  };

  const isLoadingSelectors = teamsLoading || seasonsLoading;
  const description = leagueConfig
    ? `View ${leagueConfig.name} team run rate progression per over and seasonal trends.`
    : 'View team run rate progression per over and seasonal trends.';

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <p className="text-xs sm:text-sm font-bold text-black bg-[#4ECDC4] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
        {description}
      </p>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-black mb-1">Select Team</label>
          <Select
            instanceId="team-runrate-team-select"
            options={teamOptions}
            value={selectedTeam}
            onChange={handleTeamChange}
            placeholder={isLoadingSelectors ? 'Loading...' : 'Select a team'}
            isLoading={teamsLoading}
            isClearable
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-black mb-1">Select Season</label>
          <Select
            instanceId="team-runrate-season-select"
            options={seasonOptions}
            value={selectedSeason}
            onChange={handleSeasonChange}
            placeholder={isLoadingSelectors ? 'Loading...' : 'Select a season'}
            isLoading={seasonsLoading}
            isClearable
          />
        </div>
      </div>

      {/* Per-Over Progression Chart */}
      <Card className="p-2 sm:p-4">
        <h2 className="text-base sm:text-lg font-black text-black mb-2 uppercase">
          Per-Over Run Rate Progression
        </h2>
        {progressionLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="md" color="#1a202c" />
          </div>
        )}
        {progressionError && (
          <p className="text-center font-bold text-red-600 py-4">Failed to load progression data</p>
        )}
        {!progressionLoading &&
        !progressionError &&
        selectedTeam &&
        selectedSeason &&
        progressionData ? (
          <>
            <TeamRunRateProgressionChart
              data={progressionData.data}
              team={progressionData.team}
              season={progressionData.season}
            />
            <div className="mt-2 p-2 bg-[#FFED66] border-2 border-black">
              <p className="text-xs font-bold text-black">
                Based on {progressionData.metadata.totalInnings} innings across{' '}
                {progressionData.metadata.totalMatches} matches
              </p>
            </div>
          </>
        ) : (
          !progressionLoading &&
          !progressionError && (
            <div className="p-8 bg-white border-2 border-black">
              <p className="text-center font-bold text-black">
                Select a team and season to view per-over run rate progression
              </p>
            </div>
          )
        )}
      </Card>

      {/* Seasonal Trend Chart */}
      <Card className="p-2 sm:p-4">
        <h2 className="text-base sm:text-lg font-black text-black mb-2 uppercase">
          Run Rate Trend Over Seasons
        </h2>
        {trendLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="md" color="#1a202c" />
          </div>
        )}
        {trendError && (
          <p className="text-center font-bold text-red-600 py-4">Failed to load trend data</p>
        )}
        {!trendLoading && !trendError && trendData ? (
          <>
            <RunRateTrendChart data={trendData.data} team={trendData.team} />
            <div className="mt-2 p-2 bg-[#FFED66] border-2 border-black">
              <p className="text-xs font-bold text-black">
                {trendData.team
                  ? `Showing ${trendData.team} run rate trend`
                  : 'Showing league-wide run rate trend'}{' '}
                across {trendData.metadata.totalSeasons} seasons
              </p>
            </div>
          </>
        ) : (
          !trendLoading &&
          !trendError && (
            <div className="p-8 bg-white border-2 border-black">
              <p className="text-center font-bold text-black">No trend data available</p>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
