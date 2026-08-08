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

interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  tabs: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'leaderboards',
    name: 'Leaderboards & Records',
    description: 'Top run getters, highest wicket takers, and modes of dismissal',
    tabs: ['Run Scorers', 'Wicket Takers', 'Bowling Wicket Types'],
  },
  {
    id: 'matchups',
    name: 'Matchups & Compare',
    description: '1-on-1 rivalries, multi-player matrix, and side-by-side benchmarking',
    tabs: ['Batter vs Bowler', 'Multi Matchup', 'Compare Players'],
  },
  {
    id: 'trends',
    name: 'Phase & Trends',
    description: 'Over-by-over phase stats, player progression curves, and team worms',
    tabs: ['Team Run Rate', 'Phase Stats', 'Player Progression'],
  },
  {
    id: 'teams',
    name: 'Team Insights',
    description: 'Team match records, toss impact correlation, and overall scoring rates',
    tabs: ['Team Wins', 'Team Averages'],
  },
];

const PRESETS = [
  {
    label: 'Top Run Scorers',
    tab: 'Run Scorers',
    category: 'leaderboards',
    color: 'bg-[#FF5E5B]',
  },
  {
    label: 'Wicket Takers',
    tab: 'Wicket Takers',
    category: 'leaderboards',
    color: 'bg-[#4ECDC4]',
  },
  {
    label: 'Batter vs Bowler',
    tab: 'Batter vs Bowler',
    category: 'matchups',
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
    label: 'Deep Query Builder',
    href: '/stat-explorer',
    color: 'bg-[#FFC700]',
  },
];

export default function StatsTabs() {
  const [{ tab: activeTab, category: activeCategory }, setQueryStates] = useQueryStates(
    {
      tab: parseAsString.withDefault('Run Scorers'),
      category: parseAsString.withDefault('leaderboards'),
      batter: parseAsString,
      bowler: parseAsString,
      players: parseAsString,
      seasons: parseAsString,
      statType: parseAsString,
    },
    { clearOnDefault: true },
  );

  // Determine current active category based on active tab if mismatched
  const currentCategory = useMemo(() => {
    const found = CATEGORIES.find((c) => c.tabs.includes(activeTab));
    return found ? found.id : activeCategory || 'leaderboards';
  }, [activeCategory, activeTab]);

  const activeCategoryObj = useMemo(() => {
    return CATEGORIES.find((c) => c.id === currentCategory) || CATEGORIES[0];
  }, [currentCategory]);

  const handleCategoryChange = (catId: string) => {
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

  const handleTabChange = (newTab: string) => {
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
            Custom Query Explorer →
          </Link>
        </div>
      </div>

      {/* 4. Active Tool Content Area */}
      <div className="p-2 sm:p-4 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-h-[360px] overflow-hidden text-black">
        {activeTab === 'Run Scorers' && <RunScorers />}
        {activeTab === 'Wicket Takers' && <WicketTakers />}
        {activeTab === 'Bowling Wicket Types' && <BowlingWicketTypes />}
        {activeTab === 'Batter vs Bowler' && <MatchupTab />}
        {activeTab === 'Multi Matchup' && <MultiMatchupTab />}
        {activeTab === 'Compare Players' && <PlayerCompare />}
        {activeTab === 'Team Run Rate' && <TeamRunRateTab />}
        {activeTab === 'Team Wins' && <TeamWins />}
        {activeTab === 'Team Averages' && <TeamAverages />}

        {/* Phase stats and player progression cross-links */}
        {activeTab === 'Phase Stats' && (
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

        {activeTab === 'Player Progression' && (
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
