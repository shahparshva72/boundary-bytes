'use client';

import { useBatters, useBowlers } from '@/hooks/usePlayersAPI';
import StatsTabs from '@/components/StatsTabs';
import Layout from './components/Layout';
import { MoonLoader } from 'react-spinners';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function StatsPage() {
  const { data: batters, isLoading: battersLoading, isError: battersError } = useBatters();
  const { data: bowlers, isLoading: bowlersLoading, isError: bowlersError } = useBowlers();

  const isLoading = battersLoading || bowlersLoading;
  const isError = battersError || bowlersError;

  if (isLoading) {
    return (
      <Layout description="" error={false}>
        <div className="flex items-center justify-center p-8">
          <MoonLoader color="#FF5E5B" size={48} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout description="" error={isError}>
      <StatsTabs batters={batters || []} bowlers={bowlers || []} />
    </Layout>
  );
}
