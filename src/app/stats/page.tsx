'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '@/services/playerService';
import StatsTabs from '@/components/StatsTabs';
import Layout from './components/Layout';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

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
