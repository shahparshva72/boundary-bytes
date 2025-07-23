import api from './axios';

// Fetch both batters and bowlers together
export const fetchPlayers = async () => {
  const [battersRes, bowlersRes] = await Promise.all([
    api.get('/players/batters'),
    api.get('/players/bowlers'),
  ]);
  return {
    batters: battersRes.data,
    bowlers: bowlersRes.data,
  };
};

// Fetch only batters
export const fetchBatters = async () => {
  const { data } = await api.get('/players/batters');
  return data;
};

// Fetch only bowlers
export const fetchBowlers = async () => {
  const { data } = await api.get('/players/bowlers');
  return data;
};
