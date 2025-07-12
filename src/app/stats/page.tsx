'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import StatsTabs from '@/components/StatsTabs';
import Layout from './components/Layout';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

const fetchPlayers = async () => {
  const [battersRes, bowlersRes] = await Promise.all([
    axios.get('/api/players/batters'),
    axios.get('/api/players/bowlers'),
  ]);

  return {
    batters: battersRes.data,
    bowlers: bowlersRes.data,
  };
};

export default function StatsPage() {
  const { data: playersData, isError } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  return (
    <Layout description="" error={isError}>
      <StatsTabs batters={playersData?.batters || []} bowlers={playersData?.bowlers || []} />
    </Layout>
  );
}
