'use client';

import dynamic from 'next/dynamic';
import { Suspense, type ReactNode } from 'react';
import { MoonLoader } from 'react-spinners';
import { useLeagueContext } from '@/contexts/LeagueContext';

interface AppWithLeagueSelectionProps {
  children: ReactNode;
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FFFEE0]">
    <MoonLoader color="#FF5E5B" size={48} />
  </div>
);

const LeagueSelectionScreen = dynamic(() => import('./LeagueSelection/LeagueSelectionScreen'), {
  ssr: false,
  loading: LoadingScreen,
});

const AppWithLeagueSelection = ({ children }: AppWithLeagueSelectionProps) => {
  const { isFirstVisit, selectLeague, isTransitioning, selectedLeague } = useLeagueContext();

  // Show loading while determining first visit status
  if (selectedLeague === null && !isFirstVisit) {
    return <LoadingScreen />;
  }

  // Show league selection for first-time visitors
  if (isFirstVisit && !isTransitioning) {
    return <LeagueSelectionScreen onLeagueSelect={selectLeague} isVisible={true} />;
  }

  // Show loading during transition
  if (isTransitioning) {
    return <LoadingScreen />;
  }

  // Show main app once league is selected
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};

export default AppWithLeagueSelection;
