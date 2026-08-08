'use client';

import Link from 'next/link';
import { parseAsString, useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import BowlingWicketTypes from '@/components/BowlingWicketTypes';
import MatchupTab from '@/components/MatchupTab';
import MultiMatchupTab from '@/components/MultiMatchupTab';
import PlayerCompare from '@/components/PlayerCompare';
import RunScorers from '@/components/RunScorers';
import TeamAverages from '@/components/TeamAverages';
import TeamRunRateTab from '@/components/TeamRunRateTab';
import TeamWins from '@/components/TeamWins';
import WicketTakers from '@/components/WicketTakers';

export const STAT_TAB_IDS = {
  RUN_SCORERS: 'Run Scorers',
  WICKET_TAKERS: 'Wicket Takers',
  BOWLING_WICKET_TYPES: 'Bowling Wicket Types',
  BATTER_VS_BOWLER: 'Batter vs Bowler',
  MULTI_MATCHUP: 'Multi Matchup',
  COMPARE_PLAYERS: 'Compare Players',
  TEAM_RUN_RATE: 'Team Run Rate',
  PHASE_STATS: 'Phase Stats',
  PLAYER_PROGRESSION: 'Player Progression',
  TEAM_WINS: 'Team Wins',
  TEAM_AVERAGES: 'Team Averages',
} as const;

export type StatTabId = (typeof STAT_TAB_IDS)[keyof typeof STAT_TAB_IDS];

export const STAT_CATEGORY_IDS = {
  LEADERBOARDS: 'leaderboards',
  MATCHUPS: 'matchups',
  TRENDS: 'trends',
  TEAMS: 'teams',
} as const;

export type StatCategoryId = (typeof STAT_CATEGORY_IDS)[keyof typeof STAT_CATEGORY_IDS];

interface CategoryConfig {
  id: StatCategoryId;
  name: string;
  description: string;
  tabs: StatTabId[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: STAT_CATEGORY_IDS.LEADERBOARDS,
    name: 'Leaderboards & Records',
    description: 'Top run getters, highest wicket takers, and modes of dismissal',
    tabs: [STAT_TAB_IDS.RUN_SCORERS, STAT_TAB_IDS.WICKET_TAKERS, STAT_TAB_IDS.BOWLING_WICKET_TYPES],
  },
  {
    id: STAT_CATEGORY_IDS.MATCHUPS,
    name: 'Matchups & Compare',
    description: '1-on-1 rivalries, multi-player matrix, and side-by-side benchmarking',
    tabs: [STAT_TAB_IDS.BATTER_VS_BOWLER, STAT_TAB_IDS.MULTI_MATCHUP, STAT_TAB_IDS.COMPARE_PLAYERS],
  },
  {
    id: STAT_CATEGORY_IDS.TRENDS,
    name: 'Phase & Trends',
    description: 'Over-by-over phase stats, player progression curves, and team worms',
    tabs: [STAT_TAB_IDS.TEAM_RUN_RATE, STAT_TAB_IDS.PHASE_STATS, STAT_TAB_IDS.PLAYER_PROGRESSION],
  },
  {
    id: STAT_CATEGORY_IDS.TEAMS,
    name: 'Stat Explorer & Teams',
    description: 'Team match records, toss impact correlation, and overall scoring rates',
    tabs: [STAT_TAB_IDS.TEAM_WINS, STAT_TAB_IDS.TEAM_AVERAGES],
  },
];

interface PresetConfig {
  label: string;
  tab?: StatTabId;
  category?: StatCategoryId;
  href?: string;
  color: string;
}

const PRESETS: PresetConfig[] = [
  {
    label: 'Top Run Scorers',
    tab: STAT_TAB_IDS.RUN_SCORERS,
    category: STAT_CATEGORY_IDS.LEADERBOARDS,
    color: 'bg-[#FF5E5B]',
  },
  {
    label: 'Wicket Takers',
    tab: STAT_TAB_IDS.WICKET_TAKERS,
    category: STAT_CATEGORY_IDS.LEADERBOARDS,
    color: 'bg-[#4ECDC4]',
  },
  {
    label: 'Batter vs Bowler',
    tab: STAT_TAB_IDS.BATTER_VS_BOWLER,
    category: STAT_CATEGORY_IDS.MATCHUPS,
    color: 'bg-[#FFED66]',
  },
  {
    label: 'Phase Stats (1-6 & 16-20)',
    href: '/stats/advanced',
    color: 'bg-[#FF9F1C]',
  },
  {
    label: 'Innings Progression',
    href: '/stats/player-progression',
    color: 'bg-[#4ECDC4]',
  },
  {
    label: 'Stat Explorer',
    href: '/stat-explorer',
    color: 'bg-[#FFC700]',
  },
];

export default function StatsTabs() {
  const [{ tab: activeTab, category: activeCategory }, setQueryStates] = useQueryStates(
    {
      tab: parseAsString.withDefault(STAT_TAB_IDS.RUN_SCORERS),
      category: parseAsString.withDefault(STAT_CATEGORY_IDS.LEADERBOARDS),
      batter: parseAsString,
      bowler: parseAsString,
      players: parseAsString,
      seasons: parseAsString,
      statType: parseAsString,
    },
    { clearOnDefault: true },
  );

  // Determine current active category based on active tab if mismatched
  const currentCategory = useMemo<StatCategoryId>(() => {
    const found = CATEGORIES.find((c) => (c.tabs as string[]).includes(activeTab));
    return found ? found.id : (activeCategory as StatCategoryId) || STAT_CATEGORY_IDS.LEADERBOARDS;
  }, [activeCategory, activeTab]);

  const activeCategoryObj = useMemo(() => {
    return CATEGORIES.find((c) => c.id === currentCategory) || CATEGORIES[0];
  }, [currentCategory]);

  const handleCategoryChange = (catId: StatCategoryId) => {
    const targetCat = CATEGORIES.find((c) => c.id === catId);
    if (targetCat && targetCat.tabs.length > 0) {
      setQueryStates({
        category: catId,
        tab: targetCat.tabs[0],
        batter: null,
        bowler: null,
        players: null,
        seasons: null,
        statType: null,
      });
    }
  };

  const handleTabChange = (newTab: StatTabId) => {
    setQueryStates({
      tab: newTab,
      batter: null,
      bowler: null,
      players: null,
      seasons: null,
      statType: null,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-4">
      {/* 1. Quick Preset Insight Chips */}
      <div className="bg-white border-2 border-black p-2.5 sm:p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Quick Insights & Analytics Shortcuts
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-0.5">
          {PRESETS.map((preset) => {
            if (preset.href) {
              return (
                <Link
                  key={preset.label}
                  href={preset.href}
                  className={`px-2.5 sm:px-3 py-1 text-xs font-black border-2 border-black text-black whitespace-nowrap transition-all hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${preset.color}`}
                >
                  {preset.label}
                </Link>
              );
            }
            const isCurrent = activeTab === preset.tab;
            return (
              <button
                key={preset.label}
                onClick={() => {
                  if (preset.category && preset.tab) {
                    setQueryStates({ category: preset.category, tab: preset.tab });
                  } else if (preset.tab) {
                    handleTabChange(preset.tab);
                  }
                }}
                className={`px-2.5 sm:px-3 py-1 text-xs font-black border-2 border-black whitespace-nowrap transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
                  isCurrent
                    ? 'bg-black text-white'
                    : `${preset.color} text-black hover:-translate-y-0.5`
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Tier 1: Category Segment Selector */}
      <div className="bg-[#FFFEE0] border-2 border-black p-2 sm:p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-2.5 sm:p-3 text-left border-2 border-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF5E5B] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-white text-black hover:bg-[#FFED66] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <h3 className="font-black text-xs sm:text-sm text-black truncate">{cat.name}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-black line-clamp-1 mt-1">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* 3. Tier 2: Sub-Tab Pills within the active category */}
        <div className="mt-3 pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-black uppercase text-black mr-1 hidden sm:inline">
              Views:
            </span>
            {activeCategoryObj.tabs.map((tabLabel) => {
              const isActive = activeTab === tabLabel;
              return (
                <button
                  key={tabLabel}
                  onClick={() => handleTabChange(tabLabel)}
                  className={`px-3 sm:px-4 py-1.5 font-black text-xs sm:text-sm border-2 border-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-[#4ECDC4] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {tabLabel}
                </button>
              );
            })}
          </div>

          {/* Deep link badge to Stat Explorer */}
          <Link
            href="/stat-explorer"
            className="text-xs font-black bg-[#4ECDC4] text-black px-2.5 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Stat Explorer →
          </Link>
        </div>
      </div>

      {/* 4. Active Tool Content Area */}
      <div className="p-2 sm:p-4 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-h-[360px] overflow-hidden text-black">
        {activeTab === STAT_TAB_IDS.RUN_SCORERS && <RunScorers />}
        {activeTab === STAT_TAB_IDS.WICKET_TAKERS && <WicketTakers />}
        {activeTab === STAT_TAB_IDS.BOWLING_WICKET_TYPES && <BowlingWicketTypes />}
        {activeTab === STAT_TAB_IDS.BATTER_VS_BOWLER && <MatchupTab />}
        {activeTab === STAT_TAB_IDS.MULTI_MATCHUP && <MultiMatchupTab />}
        {activeTab === STAT_TAB_IDS.COMPARE_PLAYERS && <PlayerCompare />}
        {activeTab === STAT_TAB_IDS.TEAM_RUN_RATE && <TeamRunRateTab />}
        {activeTab === STAT_TAB_IDS.TEAM_WINS && <TeamWins />}
        {activeTab === STAT_TAB_IDS.TEAM_AVERAGES && <TeamAverages />}

        {/* Phase stats and player progression cross-links */}
        {activeTab === STAT_TAB_IDS.PHASE_STATS && (
          <div className="p-6 text-center space-y-4">
            <h3 className="text-xl font-black text-black">Advanced Over-by-Over Phase Stats</h3>
            <p className="text-sm font-bold text-black max-w-md mx-auto">
              Analyze Powerplay (overs 1-6), Middle (overs 7-15), and Death (overs 16-20)
              performance metrics.
            </p>
            <Link
              href="/stats/advanced"
              className="inline-block px-6 py-2.5 bg-[#FF5E5B] text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFED66] transition-colors"
            >
              Open Phase Stats Suite →
            </Link>
          </div>
        )}

        {activeTab === STAT_TAB_IDS.PLAYER_PROGRESSION && (
          <div className="p-6 text-center space-y-4">
            <h3 className="text-xl font-black text-black">Player Innings Progression Curve</h3>
            <p className="text-sm font-bold text-black max-w-md mx-auto">
              Track how individual batters accelerate their strike rates and pacing across the 20
              overs.
            </p>
            <Link
              href="/stats/player-progression"
              className="inline-block px-6 py-2.5 bg-[#4ECDC4] text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFED66] transition-colors"
            >
              Open Innings Progression Curve →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
