'use client';

import { League, LeagueConfig } from '@/types/league';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface LeagueCardProps {
  league: League;
  config: LeagueConfig;
  onSelect: () => void;
  delay: number;
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    x: 0,
    boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)',
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
  },
  hover: {
    x: 2,
    y: 2,
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
  },
  tap: {
    x: 3,
    y: 3,
    boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
  },
};

const LeagueCard: React.FC<LeagueCardProps> = ({ league, config, onSelect, delay }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleSelect = async () => {
    setIsSelected(true);

    // Small delay for visual feedback
    setTimeout(() => {
      onSelect();
    }, 200);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <motion.div
      className="bg-white border-2 border-black p-2 sm:p-3 cursor-pointer focus:outline-none focus:border-2 focus:border-black"
      style={{
        boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
      }}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      transition={{
        delay,
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${config.fullName}`}
      aria-describedby={`${league}-stats`}
    >
      {/* Card Header */}
      <div
        className="border-2 border-black p-2 mb-2 font-black text-base sm:text-lg text-black text-center uppercase tracking-wide"
        style={{
          backgroundColor: config.colors.headerBg,
          transform: isSelected ? 'rotate(-1deg) scale(1.02)' : 'rotate(0deg)',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl sm:text-2xl">{config.icon}</span>
          <span>{config.name}</span>
        </div>
      </div>

      {/* Full Name */}
      <div className="text-center mb-2">
        <h3 className="text-sm sm:text-base font-black text-black uppercase">{config.fullName}</h3>
      </div>

      {/* Statistics Grid */}
      <div id={`${league}-stats`} className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="bg-white border-2 border-black p-1.5 text-center flex flex-col items-center justify-center min-h-16">
          <div className="text-base sm:text-lg font-black text-black leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {config.stats.teams}
          </div>
          <div className="mt-0.5 text-[10px] sm:text-xs font-bold text-black uppercase">Teams</div>
        </div>

        <div className="bg-white border-2 border-black p-1.5 text-center flex flex-col items-center justify-center min-h-16">
          <div className="text-base sm:text-lg font-black text-black leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {config.stats.matches}
          </div>
          <div className="mt-0.5 text-[10px] sm:text-xs font-bold text-black uppercase">
            Matches
          </div>
        </div>

        <div className="bg-white border-2 border-black p-1.5 text-center flex flex-col items-center justify-center min-h-16">
          <div className="text-base sm:text-lg font-black text-black leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {config.stats.players}
          </div>
          <div className="mt-0.5 text-[10px] sm:text-xs font-bold text-black uppercase">
            Players
          </div>
        </div>
      </div>

      {/* Seasons Info */}
      <div className="mt-2 text-center">
        <div
          className="inline-block px-1.5 py-0.5 border-2 border-black font-bold text-black text-xs"
          style={{ backgroundColor: config.colors.accent }}
        >
          Seasons: {config.stats.seasons.join(', ')}
        </div>
      </div>

      {/* Selection Feedback */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-10 border-2 border-black flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white border-2 border-black px-3 py-2 font-black text-base text-black uppercase">
            Selected!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeagueCard;
