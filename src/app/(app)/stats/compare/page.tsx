'use client';

import PlayerCompare from '@/components/PlayerCompare';
import StatsSubNav from '@/components/ui/StatsSubNav';
import Layout from '../components/Layout';

export const dynamic = 'force-dynamic';

export default function ComparePage() {
  return (
    <Layout title="Player Comparison" error={false}>
      <StatsSubNav current="/stats/compare" />
      <PlayerCompare />
    </Layout>
  );
}
