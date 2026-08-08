'use client';

import { Suspense } from 'react';
import StatExplorerBuilder from '@/components/stat-explorer/StatExplorerBuilder';
import StatsSubNav from '@/components/ui/StatsSubNav';
import Loading from '../loading';
import Layout from '../stats/components/Layout';

export const dynamic = 'force-dynamic';

const explorerFallback = (
  <div className="flex justify-center p-8">
    <Loading />
  </div>
);

export default function StatExplorerPage() {
  return (
    <Layout
      title="Stat Explorer"
      description="Explore granular multi-dimensional statistics across overs, batting positions, toss results, match outcomes, and venues."
    >
      <StatsSubNav current="/stat-explorer" />
      <Suspense fallback={explorerFallback}>
        <StatExplorerBuilder />
      </Suspense>
    </Layout>
  );
}
