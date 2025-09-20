'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { League } from '@/types/league';
import LeagueCard from './LeagueCard';
import { LEAGUE_CONFIGS } from '@/utils/league-config';

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
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: '#FFFEE0' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <motion.div className="mb-8 sm:mb-12" variants={headerVariants}>
        <div
          className="bg-[#FF5E5B] p-6 sm:p-8 border-4 border-black font-black text-black text-center"
          style={{
            boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
            transform: 'rotate(-1deg)',
          }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight">
            Choose Your League
          </h1>
          <p className="text-lg sm:text-xl mt-2 font-bold">
            Select your cricket statistics experience
          </p>
        </div>
      </motion.div>

      {/* League Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl">
        <LeagueCard
          league="WPL"
          config={LEAGUE_CONFIGS.WPL}
          onSelect={() => onLeagueSelect('WPL')}
          delay={0.2}
        />
        <LeagueCard
          league="IPL"
          config={LEAGUE_CONFIGS.IPL}
          onSelect={() => onLeagueSelect('IPL')}
          delay={0.35}
        />
        <LeagueCard
          league="BBL"
          config={LEAGUE_CONFIGS.BBL}
          onSelect={() => onLeagueSelect('BBL')}
          delay={0.5}
        />
      </div>

      {/* Footer */}
      <motion.div
        className="mt-8 sm:mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <p className="text-lg font-bold text-black bg-[#4ECDC4] px-4 py-2 border-2 border-black inline-block">
          Your choice will be remembered for future visits
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LeagueSelectionScreen;
