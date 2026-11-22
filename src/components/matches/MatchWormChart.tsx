'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MatchInnings } from '@/services/matchService';

const COLORS = ['#FF5E5B', '#1A535C'];

export default function MatchWormChart({ innings }: { innings: MatchInnings[] }) {
  const lastOver = Math.max(...innings.flatMap((inn) => inn.overByOver.map((over) => over.over)));
  const data = Array.from({ length: lastOver }, (_, index) => {
    const point: Record<string, number> = { over: index + 1 };
    for (const inn of innings) {
      const over = inn.overByOver.find((entry) => entry.over === index + 1);
      if (over) {
        point[inn.battingTeam] = over.cumulativeRuns;
      }
    }
    return point;
  });

  return (
    <div className="h-64 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#00000022" />
          <XAxis dataKey="over" tick={{ fill: '#000', fontSize: 12 }} />
          <YAxis tick={{ fill: '#000', fontSize: 12 }} />
          <Tooltip labelFormatter={(over) => `After over ${over}`} />
          <Legend />
          {innings.map((inn, index) => (
            <Line
              key={inn.innings}
              type="monotone"
              dataKey={inn.battingTeam}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
