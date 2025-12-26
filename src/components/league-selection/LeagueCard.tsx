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
    boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
  },
  hover: {
    x: 4,
    y: 4,
    boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
  },
  tap: {
    x: 6,
    y: 6,
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
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
      className="bg-white border-4 border-black p-4 sm:p-5 cursor-pointer focus:outline-none focus:border-6 focus:border-black"
      style={{
        boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
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
        className="border-3 border-black p-3 mb-4 font-black text-xl sm:text-2xl text-black text-center uppercase tracking-wide"
        style={{
          backgroundColor: config.colors.headerBg,
          transform: isSelected ? 'rotate(-1deg) scale(1.02)' : 'rotate(0deg)',
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl">{config.icon}</span>
          <span>{config.name}</span>
        </div>
      </div>

      {/* Full Name */}
      <div className="text-center mb-4">
        <h3 className="text-lg sm:text-xl font-black text-black uppercase">{config.fullName}</h3>
      </div>

      {/* Statistics Grid */}
      <div id={`${league}-stats`} className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white border-2 border-black p-2 text-center flex flex-col items-center justify-center min-h-20">
          <div className="text-lg sm:text-2xl font-black text-black leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {config.stats.teams}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs font-bold text-black uppercase">Teams</div>
        </div>

        <div className="bg-white border-2 border-black p-2 text-center flex flex-col items-center justify-center min-h-20">
          <div className="text-lg sm:text-2xl font-black text-black leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {config.stats.matches}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs font-bold text-black uppercase">Matches</div>
        </div>

        <div className="bg-white border-2 border-black p-2 text-center flex flex-col items-center justify-center min-h-20">
          <div className="text-lg sm:text-2xl font-black text-black leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {config.stats.players}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs font-bold text-black uppercase">Players</div>
        </div>
      </div>

      {/* Seasons Info */}
      <div className="mt-4 text-center">
        <div
          className="inline-block px-2 py-1 border-2 border-black font-bold text-black text-xs"
          style={{ backgroundColor: config.colors.accent }}
        >
          Seasons: {config.stats.seasons.join(', ')}
        </div>
      </div>

      {/* Selection Feedback */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-10 border-4 border-black flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white border-4 border-black px-6 py-3 font-black text-xl text-black uppercase">
            Selected!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeagueCard;
