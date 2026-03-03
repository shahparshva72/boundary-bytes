import api from './api';

// Fetch both batters and bowlers together
export const fetchPlayers = async () => {
  const [batters, bowlers] = await Promise.all([
    api.get('players/batters').json(),
    api.get('players/bowlers').json(),
  ]);
  return { batters, bowlers };
};

// Fetch only batters
export const fetchBatters = async () => {
  return api.get('players/batters').json();
};

// Fetch only bowlers
export const fetchBowlers = async () => {
  return api.get('players/bowlers').json();
};
