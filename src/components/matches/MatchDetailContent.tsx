import Link from 'next/link';
import { slugify } from '@/lib/slugify';
import type { MatchDetail, MatchInnings } from '@/services/matchService';
import MatchWormChart from './MatchWormChart';

const PHASE_NAMES = { powerplay: 'Powerplay', middle: 'Middle overs', death: 'Death overs' };

const cardClass =
  'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-5';

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-2 border-black px-2 py-1.5 text-left text-xs sm:text-sm font-black text-black whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-2 border-black px-2 py-1.5 text-sm sm:text-base font-mono text-black whitespace-nowrap">
      {children}
    </td>
  );
}

function PlayerLink({ name }: { name: string }) {
  return (
    <Link href={`/players/${slugify(name)}`} className="font-bold hover:underline">
      {name}
    </Link>
  );
}

function SubHeading({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h3
      className={`text-base sm:text-lg font-black text-black mb-2 mt-4 inline-block px-2 py-1 border-2 border-black ${color}`}
    >
      {children}
    </h3>
  );
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function InningsCard({ innings }: { innings: MatchInnings }) {
  const extras = innings.extras;
  const extrasParts = [
    extras.wides && `w ${extras.wides}`,
    extras.noballs && `nb ${extras.noballs}`,
    extras.byes && `b ${extras.byes}`,
    extras.legbyes && `lb ${extras.legbyes}`,
    extras.penalty && `pen ${extras.penalty}`,
  ].filter(Boolean);

  return (
    <section className={cardClass} aria-label={`${innings.battingTeam} innings`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-black pb-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black uppercase tracking-tight">
          {innings.battingTeam}
        </h2>
        <p className="text-lg sm:text-xl font-black font-mono text-black">
          {innings.runs}/{innings.wickets}{' '}
          <span className="text-sm font-bold">
            ({innings.overs} ov, RR {innings.runRate.toFixed(2)})
          </span>
        </p>
      </div>

      <SubHeading color="bg-[#4ECDC4]">Batting</SubHeading>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-[#4ECDC4]">
              <Th>Batter</Th>
              <Th>Dismissal</Th>
              <Th>R</Th>
              <Th>B</Th>
              <Th>4s</Th>
              <Th>6s</Th>
              <Th>SR</Th>
            </tr>
          </thead>
          <tbody>
            {innings.batting.map((row) => (
              <tr key={row.player} className="bg-white">
                <Td>
                  <PlayerLink name={row.player} />
                </Td>
                <Td>{row.dismissal}</Td>
                <Td>
                  {row.runs}
                  {row.notOut ? '*' : ''}
                </Td>
                <Td>{row.balls}</Td>
                <Td>{row.fours}</Td>
                <Td>{row.sixes}</Td>
                <Td>{row.balls > 0 ? row.strikeRate.toFixed(2) : '-'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm font-bold text-black">
        Extras {extras.total}
        {extrasParts.length > 0 ? ` (${extrasParts.join(', ')})` : ''}
      </p>

      <SubHeading color="bg-[#FF5E5B]">Bowling</SubHeading>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-[#FF5E5B]">
              <Th>Bowler</Th>
              <Th>O</Th>
              <Th>R</Th>
              <Th>W</Th>
              <Th>Econ</Th>
              <Th>Dots</Th>
              <Th>Wd</Th>
              <Th>Nb</Th>
            </tr>
          </thead>
          <tbody>
            {innings.bowling.map((row) => (
              <tr key={row.player} className="bg-white">
                <Td>
                  <PlayerLink name={row.player} />
                </Td>
                <Td>{row.overs}</Td>
                <Td>{row.runsConceded}</Td>
                <Td>{row.wickets}</Td>
                <Td>{row.balls > 0 ? row.economy.toFixed(2) : '-'}</Td>
                <Td>{row.dotBalls}</Td>
                <Td>{row.wides}</Td>
                <Td>{row.noballs}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubHeading color="bg-[#FFC700]">Phases</SubHeading>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr className="bg-[#FFC700]">
              <Th>Phase</Th>
              <Th>Runs</Th>
              <Th>Wkts</Th>
              <Th>Balls</Th>
              <Th>Run Rate</Th>
            </tr>
          </thead>
          <tbody>
            {innings.phases.map((phase) => (
              <tr key={phase.phase} className="bg-white">
                <Td>{PHASE_NAMES[phase.phase]}</Td>
                <Td>{phase.runs}</Td>
                <Td>{phase.wickets}</Td>
                <Td>{phase.balls}</Td>
                <Td>{phase.runRate.toFixed(2)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubHeading color="bg-[#FFED66]">Partnerships</SubHeading>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-[#FFED66]">
              <Th>Wkt</Th>
              <Th>Batters</Th>
              <Th>Runs</Th>
              <Th>Balls</Th>
            </tr>
          </thead>
          <tbody>
            {innings.partnerships.map((partnership) => (
              <tr key={partnership.wicket} className="bg-white">
                <Td>{partnership.wicket}</Td>
                <Td>
                  {partnership.batter1} {partnership.batter1Runs} ({partnership.batter1Balls}),{' '}
                  {partnership.batter2} {partnership.batter2Runs} ({partnership.batter2Balls})
                </Td>
                <Td>
                  {partnership.runs}
                  {partnership.unbroken ? '*' : ''}
                </Td>
                <Td>{partnership.balls}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {innings.fallOfWickets.length > 0 && (
        <p className="mt-3 text-sm font-bold text-black leading-relaxed">
          <span className="font-black uppercase">Fall of wickets: </span>
          {innings.fallOfWickets
            .map(
              (wicket) =>
                `${wicket.runsAtFall}/${wicket.wicketNumber} (${wicket.batsmanOut}, ${wicket.over})`,
            )
            .join(', ')}
        </p>
      )}
    </section>
  );
}

export default function MatchDetailContent({ detail }: { detail: MatchDetail }) {
  const { match, innings } = detail;

  return (
    <div className="p-2 sm:p-3 md:p-4 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4">
        <nav className="text-xs sm:text-sm font-bold text-black">
          <Link href="/" className="hover:underline">
            Matches
          </Link>
          {' > '}
          <span>{match.teams.join(' vs ') || `Match ${match.id}`}</span>
        </nav>

        <div className="bg-[#FFC700] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-black tracking-tight">
            {match.teams.join(' vs ') || `Match ${match.id}`}
          </h1>
          <p className="mt-1 text-sm sm:text-base font-bold text-black">
            {match.league} {match.season} · {formatDate(match.date)} · {match.venue}
          </p>
          {match.result && (
            <p className="mt-2 inline-block bg-white border-2 border-black px-2 py-1 text-sm sm:text-base font-black text-black">
              {match.result}
            </p>
          )}
          <p className="mt-2 text-xs sm:text-sm font-bold text-black">
            Toss: {match.tossWinner} chose to {match.tossDecision}
            {match.playerOfMatch ? ` · Player of the match: ${match.playerOfMatch}` : ''}
          </p>
        </div>

        {innings.length === 0 ? (
          <div className={cardClass}>
            <p className="font-bold text-black">No ball-by-ball data for this match.</p>
          </div>
        ) : (
          <>
            <section className={cardClass} aria-label="Run progression">
              <h2 className="text-lg sm:text-xl font-black text-black mb-2 uppercase tracking-tight">
                Run Progression
              </h2>
              <MatchWormChart innings={innings} />
            </section>
            {innings.map((inn) => (
              <InningsCard key={inn.innings} innings={inn} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
