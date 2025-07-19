'use client';

import FallOfWickets from '@/components/FallOfWickets';
import Layout from '../components/Layout';

export default function FallOfWicketsPage() {
  return (
    <Layout
      description="Analyze fall of wickets data for specific WPL matches. View batting collapses and partnership breakdowns with detailed wicket information."
      error={false}
    >
      <FallOfWickets />
    </Layout>
  );
}
