'use client';

import StatExplorerBuilder from '@/components/stat-explorer/StatExplorerBuilder';
import { Suspense } from 'react';
import Layout from '../stats/components/Layout';

export const dynamic = 'force-dynamic';

const explorerFallback = <div className="flex justify-center p-8">Loading explorer...</div>;

export default function StatExplorerPage() {
  return (
    <Layout description="">
      <Suspense fallback={explorerFallback}>
        <StatExplorerBuilder />
      </Suspense>
    </Layout>
  );
}
