import goApi from '@/services/api';

export interface PlayerProfileBio {
  fullName?: string;
  battingHand?: string;
  bowlingHand?: string;
  bowlingType?: string;
  playingRole?: string;
  playingRoleDetail?: string;
}

export interface PlayerProfileBatting {
  runs: number;
  ballsFaced: number;
  innings: number;
  notOuts: number;
  highestScore: number;
  strikeRate: number;
  average: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
}

export interface PlayerProfileBowling {
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  innings: number;
  economy: number;
  average: number;
  strikeRate: number;
  fourWickets: number;
  fiveWickets: number;
}

export interface PlayerProfileLeagueStats {
  league: string;
  batting?: PlayerProfileBatting;
  bowling?: PlayerProfileBowling;
}

export interface PlayerProfile {
  slug: string;
  name: string;
  bio?: PlayerProfileBio;
  leagueStats: PlayerProfileLeagueStats[];
  metadata: {
    availableLeagues: string[];
  };
}

export interface PlayerSlugEntry {
  slug: string;
  playerName: string;
  leagues: string[];
}

export interface PlayerSlugPagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export interface PlayerSlugListResult {
  players: PlayerSlugEntry[];
  pagination: PlayerSlugPagination;
}

export async function getPlayerProfile(slug: string): Promise<PlayerProfile | null> {
  const res = await goApi.get(`players/${encodeURIComponent(slug)}`, {
    throwHttpErrors: false,
    fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } } as RequestInit),
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to fetch player profile');
  }
  return res.json();
}

export async function listPlayerSlugs(page = 1, limit = 50): Promise<PlayerSlugListResult> {
  const data = await goApi
    .get('players', {
      searchParams: { page, limit },
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } } as RequestInit),
    })
    .json<{ data: PlayerSlugEntry[] | null; pagination: PlayerSlugPagination }>();
  return {
    players: data.data ?? [],
    pagination: data.pagination,
  };
}
