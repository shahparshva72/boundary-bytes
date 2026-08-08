'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { VALID_LEAGUES } from '@/lib/league-config';
import { League } from '@/types/league';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Stats & Analytics' | 'Navigation' | 'Games & Play' | 'Leagues' | 'Actions';
  badge?: string;
  badgeColor?: string;
  url?: string;
  onSelect?: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { selectedLeague, selectLeague, leagueConfigs } = useLeagueContext();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Command palette items
  const items: SearchItem[] = useMemo(() => {
    const statItems: SearchItem[] = [
      {
        id: 'stat-run-scorers',
        title: 'Run Scorers Leaderboard',
        subtitle: 'Top run getters, boundary counts, averages, and strike rates',
        category: 'Stats & Analytics',
        badge: 'Leaderboard',
        badgeColor: 'bg-[#FF5E5B]',
        url: '/stats?tab=Run+Scorers',
        keywords: [
          'runs',
          'batting',
          'orange cap',
          'highest',
          'sixes',
          'fours',
          'century',
          'fifties',
        ],
      },
      {
        id: 'stat-wicket-takers',
        title: 'Wicket Takers Leaderboard',
        subtitle: 'Most wickets, bowling averages, economies, and strike rates',
        category: 'Stats & Analytics',
        badge: 'Leaderboard',
        badgeColor: 'bg-[#4ECDC4]',
        url: '/stats?tab=Wicket+Takers',
        keywords: ['wickets', 'bowling', 'purple cap', 'economy', 'maidens', 'best figures'],
      },
      {
        id: 'stat-batter-vs-bowler',
        title: 'Batter vs Bowler (Head-to-Head)',
        subtitle: '1-on-1 matchup breakdown, dismissals, strike rates, and balls faced',
        category: 'Stats & Analytics',
        badge: 'Matchup',
        badgeColor: 'bg-[#FFED66]',
        url: '/stats?tab=Batter+vs+Bowler',
        keywords: ['head to head', 'matchup', 'vs', 'dismissals', 'rivalry', 'h2h'],
      },
      {
        id: 'stat-multi-matchup',
        title: 'Multi-Matchup Matrix',
        subtitle: 'Compare multiple batters against multiple bowlers in a matrix',
        category: 'Stats & Analytics',
        badge: 'Matchup',
        badgeColor: 'bg-[#FFED66]',
        url: '/stats?tab=Multi+Matchup',
        keywords: ['matrix', 'multi', 'team vs team', 'squad matchup'],
      },
      {
        id: 'stat-player-compare',
        title: 'Compare Players (2-5 Players)',
        subtitle: 'Side-by-side batting and bowling statistical comparison',
        category: 'Stats & Analytics',
        badge: 'Compare',
        badgeColor: 'bg-[#FFC700]',
        url: '/stats/compare',
        keywords: ['compare', 'comparison', 'versus', 'side by side', 'benchmarking'],
      },
      {
        id: 'stat-advanced-phase',
        title: 'Advanced Over Phase Stats',
        subtitle: 'Powerplay (1-6), Middle (7-15), and Death (16-20) phase breakdowns',
        category: 'Stats & Analytics',
        badge: 'Phase Stats',
        badgeColor: 'bg-[#FF5E5B]',
        url: '/stats/advanced',
        keywords: ['powerplay', 'death overs', 'middle overs', 'phase', 'overs', 'advanced'],
      },
      {
        id: 'stat-player-progression',
        title: 'Player Innings Progression Curve',
        subtitle: 'Strike rate acceleration and scoring curve over 20 overs',
        category: 'Stats & Analytics',
        badge: 'Progression',
        badgeColor: 'bg-[#4ECDC4]',
        url: '/stats/player-progression',
        keywords: [
          'progression',
          'strike rate curve',
          'acceleration',
          'innings graph',
          'trajectory',
        ],
      },
      {
        id: 'stat-explorer',
        title: 'Stat Explorer',
        subtitle: 'Filter by innings, venues, batting order, toss, and match results',
        category: 'Stats & Analytics',
        badge: 'Stat Explorer',
        badgeColor: 'bg-[#FF9F1C]',
        url: '/stat-explorer',
        keywords: [
          'stat explorer',
          'explorer',
          'query',
          'query builder',
          'custom query',
          'filter',
          'deep search',
          'venue',
          'custom',
          'conditions',
        ],
      },
      {
        id: 'stat-team-wins',
        title: 'Team Wins & Margins',
        subtitle: 'Match results, toss impact, and victory margins by team',
        category: 'Stats & Analytics',
        badge: 'Team',
        badgeColor: 'bg-[#FFED66]',
        url: '/stats?tab=Team+Wins',
        keywords: ['wins', 'toss', 'margins', 'defending', 'chasing', 'records'],
      },
      {
        id: 'stat-team-averages',
        title: 'Team Batting & Bowling Averages',
        subtitle: 'Overall team scoring rates, economy, and boundary percentages',
        category: 'Stats & Analytics',
        badge: 'Team',
        badgeColor: 'bg-[#4ECDC4]',
        url: '/stats?tab=Team+Averages',
        keywords: ['team average', 'boundary percentage', 'team economy', 'net run rate'],
      },
      {
        id: 'stat-team-runrate',
        title: 'Team Run Rate Progression',
        subtitle: 'Over-by-over run rate trends and scoring acceleration',
        category: 'Stats & Analytics',
        badge: 'Team',
        badgeColor: 'bg-[#FF5E5B]',
        url: '/stats?tab=Team+Run+Rate',
        keywords: ['run rate', 'over by over', 'worm', 'trend', 'acceleration'],
      },
      {
        id: 'stat-wicket-types',
        title: 'Bowling Dismissal Types',
        subtitle: 'Bowled, caught, LBW, stumped, and run out breakdowns',
        category: 'Stats & Analytics',
        badge: 'Dismissals',
        badgeColor: 'bg-[#FFC700]',
        url: '/stats?tab=Bowling+Wicket+Types',
        keywords: ['dismissal', 'bowled', 'caught', 'lbw', 'stumped', 'modes of dismissal'],
      },
    ];

    const navItems: SearchItem[] = [
      {
        id: 'nav-matches',
        title: 'Matches & Scorecards',
        subtitle: 'View all league match scores, results, and season filters',
        category: 'Navigation',
        url: '/',
        keywords: ['home', 'matches', 'fixtures', 'results', 'scorecards', 'recent'],
      },
      {
        id: 'nav-players',
        title: 'Players Directory',
        subtitle: 'Browse all player profiles, career records, and milestones',
        category: 'Navigation',
        url: '/players',
        keywords: ['players', 'roster', 'profiles', 'squads', 'careers'],
      },
      {
        id: 'nav-chat',
        title: 'AI Cricket Chat',
        subtitle: 'Ask questions and query stats using natural language AI',
        category: 'Navigation',
        badge: 'AI',
        badgeColor: 'bg-[#4ECDC4]',
        url: '/chat',
        keywords: ['chat', 'ai', 'ask', 'prompt', 'assistant', 'gemini', 'questions'],
      },
      {
        id: 'nav-news',
        title: 'Cricket News & Updates',
        subtitle: 'Read tournament headlines, match reports, and analysis',
        category: 'Navigation',
        url: '/news',
        keywords: ['news', 'articles', 'headlines', 'reports', 'updates'],
      },
    ];

    const playItems: SearchItem[] = [
      {
        id: 'play-daily-challenge',
        title: 'Daily Cricket Trivia Challenge',
        subtitle: 'Test your knowledge with daily cricket trivia',
        category: 'Games & Play',
        badge: 'Game',
        badgeColor: 'bg-[#FF5E5B]',
        url: '/play',
        keywords: ['game', 'trivia', 'quiz', 'daily', 'challenge', 'play'],
      },
      {
        id: 'play-matchup-showdown',
        title: 'Matchup Showdown',
        subtitle: 'Guess which player wins the statistical head-to-head',
        category: 'Games & Play',
        badge: 'Game',
        badgeColor: 'bg-[#FFED66]',
        url: '/play',
        keywords: ['showdown', 'game', 'guess', 'h2h game'],
      },
    ];

    const leagueItems: SearchItem[] = VALID_LEAGUES.map((league: League) => {
      const cfg = leagueConfigs[league];
      return {
        id: `league-${league}`,
        title: `Switch League: ${cfg.fullName} (${cfg.name})`,
        subtitle: `${cfg.description} • ${cfg.stats.matches} Matches across ${cfg.stats.seasons.join(', ')}`,
        category: 'Leagues',
        badge: selectedLeague === league ? 'Active' : 'Switch',
        badgeColor: selectedLeague === league ? 'bg-[#4ECDC4]' : 'bg-[#FFED66]',
        onSelect: () => {
          selectLeague(league);
          onClose();
        },
        keywords: [
          league.toLowerCase(),
          cfg.name.toLowerCase(),
          cfg.fullName.toLowerCase(),
          'tournament',
        ],
      };
    });

    return [...statItems, ...navItems, ...playItems, ...leagueItems];
  }, [leagueConfigs, onClose, selectLeague, selectedLeague]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items;
    }
    const cleanQuery = query.toLowerCase().trim();
    return items.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(cleanQuery);
      const subtitleMatch = item.subtitle.toLowerCase().includes(cleanQuery);
      const categoryMatch = item.category.toLowerCase().includes(cleanQuery);
      const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(cleanQuery));
      return titleMatch || subtitleMatch || categoryMatch || keywordMatch;
    });
  }, [items, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1),
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        if (selected.onSelect) {
          selected.onSelect();
        } else if (selected.url) {
          router.push(selected.url);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) {
      return;
    }
    const activeEl = listEl.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FFFEE0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 bg-[#FFC700] border-b-4 border-black flex items-center gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search stats, players, matchups, leaderboards, or leagues..."
            className="flex-1 bg-white border-2 border-black px-3 py-2 sm:py-2.5 font-black text-black text-sm sm:text-base outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/50"
          />
          <button
            onClick={onClose}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border-2 border-black font-black text-black text-xs sm:text-sm hover:bg-[#FF5E5B] hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto p-2 sm:p-3 divide-y-2 divide-black/10"
        >
          {filteredItems.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="font-black text-base sm:text-lg text-black">
                No matching stats or tools found
              </p>
              <p className="text-xs sm:text-sm font-bold text-black mt-1">
                Try searching for &quot;Powerplay&quot;, &quot;Run Scorers&quot;,
                &quot;Matchups&quot;, &quot;Compare&quot;, or &quot;Explorer&quot;
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => {
                    if (item.onSelect) {
                      item.onSelect();
                    } else if (item.url) {
                      router.push(item.url);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-2.5 sm:p-3 cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-[#FFED66] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white border-transparent hover:border-black/30'
                  } my-1`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm sm:text-base text-black truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] sm:text-xs font-black uppercase px-1.5 py-0.5 border border-black text-black ${
                              item.badgeColor || 'bg-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-black truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="text-xs font-black text-black hidden sm:inline-block flex-shrink-0">
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-2 sm:p-2.5 bg-black text-white text-[11px] sm:text-xs font-bold flex justify-between items-center px-3 sm:px-4">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-white/20 px-1.5 py-0.5 rounded-none font-mono">↑</kbd>{' '}
              <kbd className="bg-white/20 px-1.5 py-0.5 rounded-none font-mono">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="bg-white/20 px-1.5 py-0.5 rounded-none font-mono">↵</kbd> Select
            </span>
          </div>
          <span className="hidden sm:inline text-white/90">
            {filteredItems.length} tool{filteredItems.length === 1 ? '' : 's'} available
          </span>
        </div>
      </div>
    </div>
  );
}
