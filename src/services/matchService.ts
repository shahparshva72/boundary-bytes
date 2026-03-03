import api from './api';

interface MatchData {
  id: number;
  teams: string;
  venue: string;
  date: string;
  season: string;
}

interface MatchListResponse {
  data: MatchData[];
}

export const fetchMatches = async () => {
  return api.get('matches/list').json<MatchListResponse>();
};
