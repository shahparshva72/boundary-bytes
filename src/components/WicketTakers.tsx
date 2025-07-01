'use client';

interface WicketTakerData {
  player: string;
  wickets: number;
  ballsBowled: number;
  economy: number;
  matches: number;
}

interface WicketTakersProps {
  data: WicketTakerData[];
}

export default function WicketTakers({ data }: WicketTakersProps) {
  return (
    <div className="w-full  mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Leading Wicket Takers
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full p-8">
            <thead className="bg-[#4ECDC4] border-b-4 border-black">
              <tr>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Player
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Wickets
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Balls
                </th>
                <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                  Economy
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
                    {player.wickets}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                    {player.ballsBowled}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                    {player.economy.toFixed(2)}
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
