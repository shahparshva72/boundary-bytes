'use client';

import PlayerCompare from '@/components/PlayerCompare';
import Layout from '../components/Layout';

export const dynamic = 'force-dynamic';

export default function ComparePage() {
  return (
    <Layout title="Player Comparison" error={false}>
      <PlayerCompare />
    </Layout>
  );
}
