type FetchWithLeague = (url: string, options?: RequestInit) => Promise<Response>;

export interface SubmitDraftScorePayload {
  deviceId: string;
  date: string;
  score: number;
  optimalScore: number;
  lineup: string[];
}

export interface DraftLeaderboardEntry {
  rank: number;
  score: number;
  isYou: boolean;
}

export interface DraftLeaderboardResponse {
  league: string;
  date: string;
  totalPlayers: number;
  yourRank: number | null;
  yourScore: number | null;
  topScores: DraftLeaderboardEntry[];
}

export async function submitDraftScore(
  fetchWithLeague: FetchWithLeague,
  payload: SubmitDraftScorePayload,
): Promise<void> {
  const response = await fetchWithLeague('/api/games/daily-draft/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to submit draft score');
  }
}

export async function fetchDraftLeaderboard(
  fetchWithLeague: FetchWithLeague,
  date: string,
  deviceId: string,
): Promise<DraftLeaderboardResponse> {
  const params = new URLSearchParams({ date, deviceId });
  const response = await fetchWithLeague(`/api/games/daily-draft/leaderboard?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch draft leaderboard');
  }
  const json = (await response.json()) as { data: DraftLeaderboardResponse };
  return json.data;
}
