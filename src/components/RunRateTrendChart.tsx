'use client';

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TrendPoint {
  season: string;
  avgRunRate: number;
  totalRuns: number;
  totalBalls: number;
}

interface RunRateTrendChartProps {
  data: TrendPoint[];
  team: string | null;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2">
        <p className="font-bold text-black">Season {data.season}</p>
        <p className="text-sm font-bold text-black">Avg Run Rate: {data.avgRunRate.toFixed(2)}</p>
        <p className="text-sm text-black">
          {data.totalRuns} runs / {data.totalBalls} balls
        </p>
      </div>
    );
  }
  return null;
};

export default function RunRateTrendChart({ data, team }: RunRateTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-center font-bold text-black">No trend data available</p>
      </div>
    );
  }

  const title = team
    ? `${team} - Run Rate Trend Over Seasons`
    : 'League Run Rate Trend Over Seasons';

  return (
    <div className="w-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#4ECDC4] border border-black"></div>
            <span className="font-bold text-black">Average Run Rate</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        {data.length <= 10 ? (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="season"
              stroke="#000"
              tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
              label={{
                value: 'Season',
                position: 'insideBottom',
                offset: -5,
                fill: '#000',
                fontWeight: 'bold',
              }}
            />
            <YAxis
              stroke="#000"
              tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
              label={{
                value: 'Run Rate',
                angle: -90,
                position: 'insideLeft',
                fill: '#000',
                fontWeight: 'bold',
              }}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgRunRate" fill="#4ECDC4" stroke="#000" strokeWidth={2} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="season"
              stroke="#000"
              tick={{ fill: '#000', fontSize: 10, fontWeight: 'bold' }}
              label={{
                value: 'Season',
                position: 'insideBottom',
                offset: -5,
                fill: '#000',
                fontWeight: 'bold',
              }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#000"
              tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
              label={{
                value: 'Run Rate',
                angle: -90,
                position: 'insideLeft',
                fill: '#000',
                fontWeight: 'bold',
              }}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avgRunRate"
              stroke="#4ECDC4"
              strokeWidth={3}
              dot={{ fill: '#4ECDC4', stroke: '#000', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#FFC700', stroke: '#000', strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
      <div className="mt-4 text-xs text-black">
        <p className="font-bold">
          Seasons: {data.length} | Overall Avg:{' '}
          {(data.reduce((sum, d) => sum + d.avgRunRate, 0) / data.length).toFixed(2)} RPO
        </p>
      </div>
    </div>
  );
}
