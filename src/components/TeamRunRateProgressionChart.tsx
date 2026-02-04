'use client';

import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ProgressionPoint {
  over: number;
  phase: 'powerplay' | 'middle' | 'death';
  runs: number;
  balls: number;
  runRate: number;
}

const getPhaseColor = (phase: 'powerplay' | 'middle' | 'death'): string => {
  switch (phase) {
    case 'powerplay':
      return '#FFC700';
    case 'middle':
      return '#4ECDC4';
    case 'death':
      return '#FF5E5B';
    default:
      return '#FFC700';
  }
};

interface TeamRunRateProgressionChartProps {
  data: ProgressionPoint[];
  team: string;
  season: string;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ProgressionPoint }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2">
        <p className="font-bold text-black">Over {data.over}</p>
        <p className="text-sm text-black">
          {data.runs} runs / {data.balls} balls
        </p>
        <p className="text-sm font-bold text-black">Run Rate: {data.runRate.toFixed(2)}</p>
        <p className="text-xs text-black capitalize">Phase: {data.phase}</p>
      </div>
    );
  }
  return null;
};

export default function TeamRunRateProgressionChart({
  data,
  team,
  season,
}: TeamRunRateProgressionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-center font-bold text-black">
          No data available for {team} in {season}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-black mb-2">
          {team} - Run Rate Progression ({season})
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#FFC700] border border-black"></div>
            <span className="font-bold text-black">Powerplay (Overs 1-6)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#4ECDC4] border border-black"></div>
            <span className="font-bold text-black">Middle (Overs 7-15)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#FF5E5B] border border-black"></div>
            <span className="font-bold text-black">Death (Overs 16-20)</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="over"
            stroke="#000"
            tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }}
            label={{
              value: 'Over',
              position: 'insideBottom',
              offset: -5,
              fill: '#000',
              fontWeight: 'bold',
            }}
            domain={[1, 20]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]}
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
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={6}
            stroke="#000"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: 'End Powerplay', position: 'top', fill: '#000', fontWeight: 'bold' }}
          />
          <ReferenceLine
            x={15}
            stroke="#000"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: 'End Middle', position: 'top', fill: '#000', fontWeight: 'bold' }}
          />
          <Line
            type="monotone"
            dataKey="runRate"
            stroke="#000"
            strokeWidth={3}
            dot={{ fill: '#000', r: 3 }}
            activeDot={(props: { cx?: number; cy?: number; payload?: ProgressionPoint }) => {
              if (props.cx === undefined || props.cy === undefined || !props.payload) {
                return null;
              }
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={6}
                  fill={getPhaseColor(props.payload.phase)}
                  stroke="#000"
                  strokeWidth={2}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-xs text-black">
        <p className="font-bold">
          Total Balls: {data.reduce((sum, d) => sum + d.balls, 0)} | Total Runs:{' '}
          {data.reduce((sum, d) => sum + d.runs, 0)}
        </p>
      </div>
    </div>
  );
}
