'use client';

import React, { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLeagueContext } from '@/contexts/LeagueContext';
import LeagueSelectionScreen from './league-selection/LeagueSelectionScreen';
import { MoonLoader } from 'react-spinners';

interface AppWithLeagueSelectionProps {
  children: React.ReactNode;
}

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FFFEE0]">
    <MoonLoader color="#FF5E5B" size={48} />
  </div>
);

const AppWithLeagueSelection: React.FC<AppWithLeagueSelectionProps> = ({ children }) => {
  const { isFirstVisit, selectLeague, isTransitioning, selectedLeague } = useLeagueContext();

  // Show loading while determining first visit status
  if (selectedLeague === null && !isFirstVisit) {
    return <LoadingScreen />;
  }

  // Show league selection for first-time visitors
  if (isFirstVisit && !isTransitioning) {
    return (
      <AnimatePresence mode="wait">
        <LeagueSelectionScreen
          key="league-selection"
          onLeagueSelect={selectLeague}
          isVisible={true}
        />
      </AnimatePresence>
    );
  }

  // Show loading during transition
  if (isTransitioning) {
    return <LoadingScreen />;
  }

  // Show main app once league is selected
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </AnimatePresence>
  );
};

export default AppWithLeagueSelection;
