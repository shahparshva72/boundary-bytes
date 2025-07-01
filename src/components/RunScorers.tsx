'use client';

interface RunScorerData {
  player: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
  matches: number;
}

interface RunScorersProps {
  data: RunScorerData[];
}

export default function RunScorers({ data }: RunScorersProps) {
  return (
    <div className="w-full  mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Leading Run Scorers
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#4ECDC4] border-b-4 border-black">
              <tr>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Player
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Runs
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Balls
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Strike Rate
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide">
                  Matches
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((player, index) => (
                <tr
                  key={player.player}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]'
                  } border-b-2 border-black hover:bg-[#FFED66] transition-colors duration-150`}
                >
                  <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                    {player.player}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                    {player.runs}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                    {player.ballsFaced}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                    {player.strikeRate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-black">{player.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
