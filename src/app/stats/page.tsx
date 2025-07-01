'use client';

import { useEffect, useState } from 'react';
import StatsTabs from '@/components/StatsTabs';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface Player {
  player: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
  matches: number;
}

interface Bowler {
  player: string;
  wickets: number;
  ballsBowled: number;
  economy: number;
  matches: number;
}

export default function StatsPage() {
  const [batters, setBatters] = useState<string[]>([]);
  const [bowlers, setBowlers] = useState<string[]>([]);
  const [runScorers, setRunScorers] = useState<Player[]>([]);
  const [wicketTakers, setWicketTakers] = useState<Bowler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [battersRes, bowlersRes, runScorersRes, wicketTakersRes] = await Promise.all([
          fetch('/api/players/batters'),
          fetch('/api/players/bowlers'),
          fetch('/api/stats/leading-run-scorers'),
          fetch('/api/stats/leading-wicket-takers'),
        ]);

        const [battersData, bowlersData, runScorersData, wicketTakersData] = await Promise.all([
          battersRes.json(),
          bowlersRes.json(),
          runScorersRes.json(),
          wicketTakersRes.json(),
        ]);

        setBatters(battersData);
        setBowlers(bowlersData);
        setRunScorers(runScorersData);
        setWicketTakers(wicketTakersData);
      } catch (error) {
        console.error('Error fetching stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
        <main className="flex flex-col gap-[40px] items-center w-full max-w-5xl mx-auto my-8">
          <div className="flex flex-col items-center gap-6 mb-4 w-full">
            <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
                WPL STATS
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="text-xl font-bold">Loading stats...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full max-w-5xl mx-auto my-8">
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
              WPL STATS
            </h1>
          </div>
        </div>
        <StatsTabs
          batters={batters}
          bowlers={bowlers}
          runScorers={runScorers}
          wicketTakers={wicketTakers}
        />
      </main>
    </div>
  );
}
