'use client';

import StatsTabs from '@/components/StatsTabs';
import { useBatters, useBowlers } from '@/hooks/usePlayersAPI';
import Layout from './components/Layout';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function StatsPage() {
  const { data: batters, isLoading: battersLoading, isError: battersError } = useBatters();
  const { data: bowlers, isLoading: bowlersLoading, isError: bowlersError } = useBowlers();

  const isLoading = battersLoading || bowlersLoading;
  const isError = battersError || bowlersError;

  return (
    <Layout description="" error={isError}>
      {isLoading ? (
        <div className="w-full max-w-6xl px-4 animate-pulse">
          {/* Tabs skeleton */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-300 border-2 border-black px-6 whitespace-nowrap"
              ></div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6">
            <div className="space-y-4">
              {/* Form fields skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 w-24"></div>
                  <div className="h-10 bg-gray-200 border-2 border-black"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 w-24"></div>
                  <div className="h-10 bg-gray-200 border-2 border-black"></div>
                </div>
              </div>

              {/* Button skeleton */}
              <div className="h-10 bg-gray-300 border-2 border-black w-32"></div>

              {/* Results skeleton */}
              <div className="mt-8 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 border-2 border-black"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <StatsTabs batters={batters || []} bowlers={bowlers || []} />
      )}
    </Layout>
  );
}
