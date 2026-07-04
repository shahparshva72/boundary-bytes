'use client';

import { Suspense } from 'react';
import StatExplorerBuilder from '@/components/stat-explorer/StatExplorerBuilder';
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
    <Layout title="Stat Explorer" description="">
      <Suspense fallback={explorerFallback}>
        <StatExplorerBuilder />
      </Suspense>
    </Layout>
  );
}
