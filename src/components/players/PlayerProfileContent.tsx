import Link from 'next/link';
import type { PlayerProfile, PlayerProfileLeagueStats } from '@/services/playerService';

interface PlayerProfileContentProps {
  profile: PlayerProfile;
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return '-';
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(2);
}

function formatRole(bio: PlayerProfile['bio']): string {
  if (!bio) {
    return '';
  }
  const parts: string[] = [];
  if (bio.playingRole) {
    parts.push(bio.playingRole.replace(/_/g, ' '));
  }
  if (bio.battingHand) {
    parts.push(`${bio.battingHand}-hand bat`);
  }
  if (bio.bowlingType) {
    parts.push(`${bio.bowlingType} bowler`);
  }
  return parts.join(' · ');
}

function LeagueStatCard({
  stats,
  playerName,
}: {
  stats: PlayerProfileLeagueStats;
  playerName: string;
}) {
  const { league, batting, bowling } = stats;
  const proseParts: string[] = [];
  if (batting && batting.innings > 0) {
    proseParts.push(
      `In the ${league}, ${playerName} has scored ${batting.runs} runs at an average of ${formatNumber(batting.average)} and a strike rate of ${formatNumber(batting.strikeRate)} across ${batting.innings} innings.`,
    );
  }
  if (bowling && bowling.innings > 0) {
    proseParts.push(
      `With the ball, ${playerName} has taken ${bowling.wickets} wickets at an economy of ${formatNumber(bowling.economy)} and an average of ${formatNumber(bowling.average)}.`,
    );
  }

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-5">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black mb-3 text-center uppercase tracking-tight">
        {league}
      </h2>

      {proseParts.length > 0 && (
        <div className="bg-[#FFFEE0] border-2 border-black p-2 sm:p-3 mb-3 sm:mb-4">
          {proseParts.map((sentence, index) => (
            <p key={index} className="text-sm sm:text-base font-bold text-black leading-relaxed">
              {sentence}
            </p>
          ))}
        </div>
      )}

      {batting && batting.innings > 0 && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-black text-black mb-2 bg-[#4ECDC4] inline-block px-2 py-1 border-2 border-black">
            Batting
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#4ECDC4]">
                  <TableHead>Runs</TableHead>
                  <TableHead>Balls</TableHead>
                  <TableHead>Inns</TableHead>
                  <TableHead>Avg</TableHead>
                  <TableHead>SR</TableHead>
                  <TableHead>HS</TableHead>
                  <TableHead>4s</TableHead>
                  <TableHead>6s</TableHead>
                  <TableHead>50s/100s</TableHead>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <TableCell>{batting.runs}</TableCell>
                  <TableCell>{batting.ballsFaced}</TableCell>
                  <TableCell>{batting.innings}</TableCell>
                  <TableCell>{formatNumber(batting.average)}</TableCell>
                  <TableCell>{formatNumber(batting.strikeRate)}</TableCell>
                  <TableCell>{batting.highestScore}</TableCell>
                  <TableCell>{batting.fours}</TableCell>
                  <TableCell>{batting.sixes}</TableCell>
                  <TableCell>{`${batting.fifties}/${batting.hundreds}`}</TableCell>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bowling && bowling.innings > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-black text-black mb-2 bg-[#FF5E5B] inline-block px-2 py-1 border-2 border-black">
            Bowling
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#FF5E5B]">
                  <TableHead>Wkts</TableHead>
                  <TableHead>Balls</TableHead>
                  <TableHead>Runs</TableHead>
                  <TableHead>Inns</TableHead>
                  <TableHead>Avg</TableHead>
                  <TableHead>Econ</TableHead>
                  <TableHead>SR</TableHead>
                  <TableHead>4w/5w</TableHead>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <TableCell>{bowling.wickets}</TableCell>
                  <TableCell>{bowling.ballsBowled}</TableCell>
                  <TableCell>{bowling.runsConceded}</TableCell>
                  <TableCell>{bowling.innings}</TableCell>
                  <TableCell>{formatNumber(bowling.average)}</TableCell>
                  <TableCell>{formatNumber(bowling.economy)}</TableCell>
                  <TableCell>{formatNumber(bowling.strikeRate)}</TableCell>
                  <TableCell>{`${bowling.fourWickets}/${bowling.fiveWickets}`}</TableCell>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-2 border-black px-2 py-1.5 text-left text-xs sm:text-sm font-black text-black whitespace-nowrap">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-2 border-black px-2 py-1.5 text-sm sm:text-base font-mono text-black whitespace-nowrap">
      {children}
    </td>
  );
}

export default function PlayerProfileContent({ profile }: PlayerProfileContentProps) {
  const roleText = formatRole(profile.bio);
  const leaguesText = profile.leagueStats.map((s) => s.league).join(', ');

  return (
    <div className="p-2 sm:p-3 md:p-4 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4">
        <nav className="text-xs sm:text-sm font-bold text-black">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {' > '}
          <Link href="/players" className="hover:underline">
            Players
          </Link>
          {' > '}
          <span className="text-black/70">{profile.name}</span>
        </nav>

        <div className="bg-[#FFC700] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight">
            {profile.name}
          </h1>
          {roleText && (
            <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg font-bold text-black uppercase tracking-wide">
              {roleText}
            </p>
          )}
          {leaguesText && (
            <p className="mt-2 text-xs sm:text-sm font-bold text-black/80">
              Leagues: {leaguesText}
            </p>
          )}
        </div>

        {profile.bio && (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-5">
            <h2 className="text-lg sm:text-xl font-black text-black mb-2">Player Bio</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
              {profile.bio.fullName && (
                <>
                  <dt className="font-bold text-black/70">Full name</dt>
                  <dd className="font-mono text-black">{profile.bio.fullName}</dd>
                </>
              )}
              {profile.bio.battingHand && (
                <>
                  <dt className="font-bold text-black/70">Batting hand</dt>
                  <dd className="font-mono text-black">{profile.bio.battingHand}</dd>
                </>
              )}
              {profile.bio.bowlingHand && (
                <>
                  <dt className="font-bold text-black/70">Bowling hand</dt>
                  <dd className="font-mono text-black">{profile.bio.bowlingHand}</dd>
                </>
              )}
              {profile.bio.bowlingType && (
                <>
                  <dt className="font-bold text-black/70">Bowling type</dt>
                  <dd className="font-mono text-black">{profile.bio.bowlingType}</dd>
                </>
              )}
              {profile.bio.playingRole && (
                <>
                  <dt className="font-bold text-black/70">Playing role</dt>
                  <dd className="font-mono text-black">
                    {profile.bio.playingRole.replace(/_/g, ' ')}
                  </dd>
                </>
              )}
              {profile.bio.playingRoleDetail && (
                <>
                  <dt className="font-bold text-black/70">Role detail</dt>
                  <dd className="font-mono text-black">
                    {profile.bio.playingRoleDetail.replace(/_/g, ' ')}
                  </dd>
                </>
              )}
            </dl>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
          {profile.leagueStats.map((stats) => (
            <LeagueStatCard key={stats.league} stats={stats} playerName={profile.name} />
          ))}
        </div>
      </div>
    </div>
  );
}
