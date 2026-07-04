'use client';

import FallOfWickets from '@/components/FallOfWickets';
import Layout from '../components/Layout';

export default function FallOfWicketsPage() {
  return (
    <Layout
      title="Fall of Wickets"
      description="Analyze the fall of wickets throughout the innings with detailed statistics and visualizations."
      error={false}
    >
      <FallOfWickets />
    </Layout>
  );
}
