'use client';

import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
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
import { MultiSelect } from './ui';

interface LeagueTrendPoint {
  league: string;
  season: string;
  avgRunRate: number;
  totalRuns: number;
  totalBalls: number;
}

const LINE_COLORS = ['#FF5E5B', '#1A535C', '#FF9F1C', '#9B5DE5', '#2E86AB', '#00BB7F'];
const DEFAULT_LEAGUES = 5;

export default function LeagueRunRateTrendChart({ data }: { data: LeagueTrendPoint[] }) {
  const [selectedParam, setSelected] = useQueryState('rrLeagues', parseAsArrayOf(parseAsString));

  const leagues = useMemo(() => {
    const balls = new Map<string, number>();
    for (const point of data) {
      balls.set(point.league, (balls.get(point.league) ?? 0) + point.totalBalls);
    }
    return [...balls.entries()].sort((a, b) => b[1] - a[1]).map(([league]) => league);
  }, [data]);

  const selected = useMemo(() => {
    const chosen = [...new Set(selectedParam ?? [])]
      .filter((league) => leagues.includes(league))
      .slice(0, LINE_COLORS.length);
    return chosen.length > 0 ? chosen : leagues.slice(0, DEFAULT_LEAGUES);
  }, [selectedParam, leagues]);

  const chartData = useMemo(() => {
    const bySeason = new Map<string, Record<string, number | string>>();
    for (const point of data) {
      if (!selected.includes(point.league)) {
        continue;
      }
      const row = bySeason.get(point.season) ?? { season: point.season };
      row[point.league] = point.avgRunRate;
      bySeason.set(point.season, row);
    }
    return [...bySeason.values()].sort((a, b) => String(a.season).localeCompare(String(b.season)));
  }, [data, selected]);

  return (
    <div className="w-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-black">Run Rate Trend by League</h3>
          <p className="text-xs font-bold text-black">
            One line per league, because leagues play in different halves of the year and score at
            different rates.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <label className="block text-xs font-black text-black uppercase mb-1">Leagues</label>
          <MultiSelect
            options={leagues.map((league) => ({ value: league, label: league }))}
            value={selected.map((league) => ({ value: league, label: league }))}
            onChange={(values) => setSelected(values.length ? values.map((v) => v.value) : null)}
            maxSelections={LINE_COLORS.length}
            isClearable={false}
            instanceId="runrate-trend-leagues"
          />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#00000022" />
          <XAxis
            dataKey="season"
            stroke="#000"
            tick={{ fill: '#000', fontSize: 10, fontWeight: 'bold' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#000"
            tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
            tickFormatter={(value: number) => value.toFixed(1)}
          />
          <Tooltip />
          <Legend />
          {selected.map((league, index) => (
            <Line
              key={league}
              type="monotone"
              dataKey={league}
              stroke={LINE_COLORS[index % LINE_COLORS.length]}
              strokeWidth={3}
              dot={{ r: 3, stroke: '#000', strokeWidth: 1 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
