import api from './axios';

export const fetchMatches = async () => {
  const { data } = await api.get('/matches/list');
  return data;
};
