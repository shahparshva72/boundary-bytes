'use client';

import { useState } from 'react';
import { fetchMatches } from '@/services/matchService';
import { useQuery } from '@tanstack/react-query';
import { MoonLoader } from 'react-spinners';

interface MatchData {
  id: number;
  teams: string;
  venue: string;
  date: string;
  season: string;
}

interface MatchSelectorProps {
  onMatchSelect: (matchId: number) => void;
  selectedMatchId?: number;
}

export default function MatchSelector({ onMatchSelect, selectedMatchId }: MatchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['matchList'],
    queryFn: fetchMatches,
  });

  const filteredMatches =
    data?.data?.filter(
      (match: MatchData) =>
        match.teams.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.date.includes(searchTerm) ||
        match.season.includes(searchTerm),
    ) || [];

  const selectedMatch = data?.data?.find((match: MatchData) => match.id === selectedMatchId);

  const handleMatchSelect = (match: MatchData) => {
    onMatchSelect(match.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="bg-white border-4 border-black rounded-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left text-lg font-bold text-black bg-white hover:bg-[#FFED66] transition-colors duration-150 flex justify-between items-center"
        >
          <span className="truncate">
            {selectedMatch
              ? `${selectedMatch.teams} - ${selectedMatch.venue} (${selectedMatch.date})`
              : 'Select a match...'}
          </span>
          <span className="ml-2 text-black">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border-4 border-black border-t-0 max-h-80 overflow-hidden">
            <div className="p-2 border-b-2 border-black">
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-lg font-bold text-black bg-white border-2 border-black focus:outline-none focus:border-[#4ECDC4]"
              />
            </div>

            <div className="overflow-y-auto max-h-64">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <MoonLoader color="#4F46E5" size={30} />
                </div>
              ) : filteredMatches.length > 0 ? (
                filteredMatches.map((match: MatchData) => (
                  <button
                    key={match.id}
                    onClick={() => handleMatchSelect(match)}
                    className="w-full px-4 py-3 text-left text-sm font-bold text-black hover:bg-[#FFED66] transition-colors duration-150 border-b border-black last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-black">{match.teams}</span>
                      <span className="text-xs">
                        {match.venue} • {match.date} • {match.season}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm font-bold text-black text-center">
                  No matches found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
