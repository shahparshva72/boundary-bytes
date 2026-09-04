'use client';

import dynamic from 'next/dynamic';

const Analytics = dynamic(
  () => import('@vercel/analytics/next').then((module) => module.Analytics),
  { ssr: false },
);

export default function DeferredAnalytics() {
  return <Analytics />;
}
