import Image from "next/image";

async function getMatches(page = 1, season?: string) {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: '5'
  });
  if (season) searchParams.append('season', season);

  const res = await fetch(`http://localhost:3000/api/matches?${searchParams}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; season?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const { matches, pagination, seasons } = await getMatches(currentPage, searchParams.season);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full max-w-5xl mx-auto my-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">BOUNDARY BYTES</h1>
          </div>
          <p className="text-xl font-bold text-black bg-[#4ECDC4] px-6 py-3 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            An upcoming cricket stats query website.
          </p>
          <a
            href="/query"
            className="px-6 py-3 bg-[#FF9F1C] font-bold border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Try SQL Query Explorer
          </a>
        </div>

        {/* Season Filter */}
        <div className="w-full flex flex-wrap gap-4 justify-center">
          <a
            href="/"
            className={`px-4 py-2 font-bold border-2 border-black text-black ${
              !searchParams.season ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-[#FF5E5B] transition-colors'
            }`}
          >
            All Seasons
          </a>
          {seasons.map((season: string) => (
            <a
              key={season}
              href={`/?season=${season}`}
              className={`px-4 py-2 font-bold border-2 border-black text-black ${
                searchParams.season === season ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-[#FF5E5B] transition-colors'
              }`}
            >
              {season}
            </a>
          ))}
        </div>

        {/* Match cards */}
        <div className="w-full grid gap-12">
          {matches.map((match: any) => (
            <div
              key={match.id}
              className="p-8 bg-white rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="font-black text-3xl text-black">{match.venue}</h2>
                  <p className="text-lg font-bold text-black mt-1 bg-[#4ECDC4] px-3 py-1 inline-block border-2 border-black">
                    {new Date(match.startDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-lg bg-[#FF9F1C] px-4 py-2 rounded-none border-3 border-black font-black text-black self-start">
                  {match.season}
                </div>
              </div>

              <div className="mb-6 grid gap-6">
                <div className="font-mono bg-white p-6 rounded-none border-4 border-black">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-2xl text-black">{match.team1}</span>
                    <span className="font-black text-2xl bg-[#FF5E5B] px-3 py-1 border-2 border-black text-black">
                      {match.innings1Score}
                    </span>
                  </div>
                  <div className="my-4 border-b-4 border-dashed border-black"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-2xl text-black">{match.team2}</span>
                    <span className="font-black text-2xl bg-[#4ECDC4] px-3 py-1 border-2 border-black text-black">
                      {match.innings2Score}
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFED66] p-4 rounded-none border-4 border-black text-center font-bold text-xl text-black w-full max-w-md mx-auto">
                  {match.result}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <div className="text-base bg-[#FF9F1C] px-4 py-2 rounded-none border-3 border-black font-black text-black">
                  Match #{match.id}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex gap-4 justify-center flex-wrap">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <a
                key={page}
                href={`/?page=${page}${searchParams.season ? `&season=${searchParams.season}` : ''}`}
                className={`px-6 py-3 font-bold border-2 border-black text-black ${
                  currentPage === page
                    ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-[#FF5E5B] transition-colors'
                }`}
              >
                {page}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}