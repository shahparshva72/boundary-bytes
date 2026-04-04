'use client';

import StatExplorerBuilder from '@/components/stat-explorer/StatExplorerBuilder';
import Layout from '../stats/components/Layout';

export const dynamic = 'force-dynamic';

export default function StatExplorerPage() {
  return (
    <Layout description="">
      <StatExplorerBuilder />
    </Layout>
  );
}
