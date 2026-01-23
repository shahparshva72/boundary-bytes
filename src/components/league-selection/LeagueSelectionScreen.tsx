'use client';

import { League } from '@/types/league';
import { LEAGUE_CONFIGS } from '@/utils/league-config';
import { motion } from 'framer-motion';
import React from 'react';
import LeagueCard from './LeagueCard';

interface LeagueSelectionScreenProps {
  onLeagueSelect: (league: League) => void;
  isVisible: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const headerVariants = {
  hidden: {
    opacity: 0,
    y: -30,
    rotate: -5,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: -1,
  },
};

const LeagueSelectionScreen: React.FC<LeagueSelectionScreenProps> = ({
  onLeagueSelect,
  isVisible,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      style={{ backgroundColor: '#FFFEE0' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Header */}
        <motion.div className="mb-4 sm:mb-6" variants={headerVariants}>
          <div
            className="bg-[#FF5E5B] p-3 sm:p-4 border-2 border-black font-black text-black text-center"
            style={{
              boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
              transform: 'rotate(-1deg)',
            }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl uppercase tracking-tight">
              Choose Your League
            </h1>
            <p className="text-sm sm:text-base mt-1 font-bold">
              Select your cricket statistics experience
            </p>
          </div>
        </motion.div>

        {/* League Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 w-full max-w-7xl">
          {(Object.keys(LEAGUE_CONFIGS) as League[]).map((league, index) => (
            <LeagueCard
              key={league}
              league={league}
              config={LEAGUE_CONFIGS[league]}
              onSelect={() => onLeagueSelect(league)}
              delay={0.2 + index * 0.15}
            />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="mt-4 sm:mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <p className="text-sm font-bold text-black bg-[#4ECDC4] px-2 py-1 border-2 border-black inline-block">
            Your choice will be remembered for future visits
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeagueSelectionScreen;
