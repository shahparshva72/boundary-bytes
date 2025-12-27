'use client';

import StatsTabs from '@/components/StatsTabs';
import Layout from './components/Layout';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function StatsPage() {
  return (
    <Layout description="" error={false}>
      <StatsTabs />
    </Layout>
  );
}
