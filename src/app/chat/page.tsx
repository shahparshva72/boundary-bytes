'use client';

import AiFeedback from '@/components/AiFeedback';
import Tooltip from '@/components/ui/Tooltip';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { useTextToSql } from '@/hooks/useTextToSql';
import { useEffect, useState } from 'react';
import { MoonLoader } from 'react-spinners';

export default function TextToSqlPage() {
  const { selectedLeague } = useLeagueContext();
  const { mutate, data, error, isPending, reset } = useTextToSql();
  const [question, setQuestion] = useState('');
  const [touched, setTouched] = useState(false);
  const [showSlowMsg, setShowSlowMsg] = useState(false);

  useEffect(() => {
    if (isPending) {
      const id = setTimeout(() => setShowSlowMsg(true), 2000);
      return () => clearTimeout(id);
    }
    setShowSlowMsg(false);
  }, [isPending]);

  const charLimit = 500;
  const validationRegex = /^[a-zA-Z0-9\s?.,'"-]+$/;
  const isValid =
    question.length > 0 && question.length <= charLimit && validationRegex.test(question);
  const showValidationError = touched && !isValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || !selectedLeague) {
      return;
    }
    mutate(question);
  };

  const handleReset = () => {
    setQuestion('');
    reset();
    setTouched(false);
  };

  const formatDisplayValue = (v: unknown): string => {
    if (typeof v === 'number') {
      return v % 1 === 0 ? v.toString() : v.toFixed(2);
    } else if (!isNaN(Number(v as string))) {
      const num = Number(v as string);
      return num % 1 === 0 ? num.toString() : num.toFixed(2);
    } else {
      return String(v);
    }
  };

  const renderResult = () => {
    if (isPending) {
      return (
        <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-white border-2 border-black shadow-[4px_4px_0_#000] ">
          <MoonLoader color="#1a202c" size={48} />
          <p className="font-bold text-black text-center text-base sm:text-lg">
            Crunching the numbers...
          </p>
          {showSlowMsg && (
            <p className="text-xs sm:text-sm font-mono bg-[#FFED66] px-2 sm:px-3 py-2 border-2 border-black ">
              Big over of data - hang tight!
            </p>
          )}
        </div>
      );
    }

    function isTextToSqlError(e: unknown): e is import('@/hooks/useTextToSql').TextToSqlError {
      return (
        typeof e === 'object' &&
        e !== null &&
        'success' in e &&
        (e as { success: unknown }).success === false
      );
    }

    if (error) {
      const structured = isTextToSqlError(error) ? error : null;
      if (typeof window !== 'undefined') {
        console.error('Text-to-SQL error:', error);
      }
      return (
        <div
          className="p-4 sm:p-6 md:p-8 bg-[#FF5E5B] border-2 border-black shadow-[4px_4px_0_#000]  flex flex-col gap-3 sm:gap-4"
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black">
            Unable to fetch stats
          </h3>
          <p className="font-mono text-black text-sm sm:text-base">
            Something went wrong while processing that question. Please try again or tweak your
            phrasing.
          </p>
          {structured?.code === 'RATE_LIMIT_ERROR' && (
            <span className="inline-block bg-[#FFED66] px-2 sm:px-3 py-1 font-bold border-2 border-black w-fit text-sm sm:text-base">
              Rate limit - give it a moment
            </span>
          )}
          {structured?.tips && structured.tips.length > 0 && (
            <ul className="list-disc list-inside bg-[#FFFEE0] border-2 border-black p-2 sm:p-3 font-mono text-xs sm:text-sm text-black ">
              {structured.tips.map((t: string, idx: number) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          )}
          {structured?.suggestions && structured.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {structured.suggestions.slice(0, 4).map((s: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuestion(s)}
                  className="text-xs sm:text-sm bg-white px-2 sm:px-3 py-1 sm:py-2 border-2 border-black font-bold  shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  {s.replace(/"/g, '&quot;')}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="self-start mt-2 bg-white px-3 sm:px-4 py-2 font-bold border-2 border-black text-sm sm:text-base shadow-[2px_2px_0_#000] hover:bg-[#FFED66] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            Clear
          </button>
        </div>
      );
    }

    if (data) {
      return (
        <div
          className="p-4 sm:p-6 md:p-8 bg-white border-2 border-black shadow-[4px_4px_0_#000]  flex flex-col gap-4 sm:gap-6"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
            <span className="bg-[#4ECDC4] px-3 sm:px-4 py-1 sm:py-2 border-2 border-black font-black text-black text-sm sm:text-base">
              Rows: {data.metadata.rowCount}
            </span>
          </div>
          {data.metadata.rowCount === 0 ? (
            <p className="font-mono text-black text-sm sm:text-base">
              No stats found - try another angle (e.g. &quot;Top run scorers in WPL 2023&quot;).
            </p>
          ) : (
            <div
              className="overflow-x-auto border-2 border-black "
              role="region"
              aria-label="Cricket statistics results"
            >
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#F9A825]">
                    {Object.keys(data.data[0] as Record<string, unknown>).map((key) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-2 sm:px-3 md:px-4 py-2 border-2 border-black font-black text-left text-black whitespace-nowrap text-xs sm:text-sm md:text-base"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FEF9C3]'}>
                      {Object.entries(row as Record<string, unknown>).map(([k, v]) => (
                        <td
                          key={k}
                          className="px-2 sm:px-3 md:px-4 py-2 border-2 border-black font-mono text-xs sm:text-sm text-black whitespace-nowrap max-w-[120px] sm:max-w-[180px] md:max-w-[240px] overflow-hidden text-ellipsis"
                          title={String(v)}
                        >
                          {formatDisplayValue(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="bg-[#FF5E5B] px-3 sm:px-4 py-2 font-black border-2 border-black text-sm sm:text-base shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              Ask Another
            </button>
          </div>
          {data.requestId && <AiFeedback requestId={data.requestId} />}
        </div>
      );
    }

    return null;
  };

  const renderSuggestions = () => {
    const suggestions = [
      {
        category: 'Player Stats',
        color: 'bg-[#4ECDC4]',
        queries: [
          'Virat Kohli runs in IPL 2023',
          'MS Dhoni strike rate in IPL',
          'Jasprit Bumrah economy rate in IPL 2022',
          'Rohit Sharma sixes in IPL',
          'Smriti Mandhana runs in WPL 2023',
        ],
      },
      {
        category: 'Leaderboards',
        color: 'bg-[#FF9F1C]',
        queries: [
          'Top 10 run scorers in IPL',
          'Top 5 wicket takers in WPL',
          'Most sixes in IPL 2023',
          'Best economy rate in IPL 2022',
          'Highest strike rates in WPL',
        ],
      },
      {
        category: 'Team Performance',
        color: 'bg-[#FFED66]',
        queries: [
          'Which team has most wins in IPL',
          'Mumbai Indians vs Chennai Super Kings head to head',
          'Royal Challengers Bangalore wins in IPL 2023',
          'Team with most boundaries in IPL',
          'Delhi Capitals vs Mumbai Indians comparison',
        ],
      },
      {
        category: 'Head-to-Head',
        color: 'bg-[#FF5E5B]',
        queries: [
          'Virat Kohli vs Jasprit Bumrah matchup',
          'MS Dhoni vs Rashid Khan stats',
          'Rohit Sharma vs Khaleel Ahmed stats',
          'David Warner vs R Ashwin stats',
          'Alyssa Healy batting record vs Renuka Singh',
        ],
      },
    ];

    return (
      <div className="p-4 sm:p-6 bg-white border-2 border-black shadow-[4px_4px_0_#000]  flex flex-col gap-4 sm:gap-6">
        <h3 className="text-xl sm:text-2xl md:text-3xl text-black text-center flex items-center justify-center">
          <span className="text-lg sm:text-xl md:text-2xl mr-2">💡</span>
          Query Suggestions
        </h3>
        <p className="font-mono text-black text-center text-xs sm:text-sm">
          Click any suggestion to try it out, or use them as inspiration for your own questions!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {suggestions.map((section, sectionIdx) => (
            <div key={sectionIdx} className="flex flex-col">
              <h4
                className={`${section.color} text-black text-center text-lg sm:text-xl md:text-2xl font-bold py-2 sm:py-3 border-2 border-black shadow-[2px_2px_0_#000]`}
              >
                {section.category}
              </h4>
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-white border-2 border-black shadow-[2px_2px_0_#000] border-t-0">
                {section.queries.map((query, queryIdx) => (
                  <button
                    key={queryIdx}
                    type="button"
                    onClick={() => setQuestion(query)}
                    className="w-full text-left p-2 sm:p-3 bg-gray-100  border-2 border-black shadow-[2px_2px_0_#000] text-xs sm:text-sm font-mono hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    {`"${query.replace(/"/g, '&quot;')}"`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 sm:mt-4 p-3 sm:p-4 bg-[#FCD34D] border-2 border-black shadow-[2px_2px_0_#000]  flex items-center justify-center">
          <span className="text-lg sm:text-2xl mr-2 sm:mr-3">✨</span>
          <p className="font-semibold text-black text-xs sm:text-sm text-center">
            Pro Tip: Try asking about specific seasons (e.g., &quot;IPL 2023&quot;), player
            comparisons, or team performance!
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFEE0] text-black">
      <div className="container mx-auto p-3 sm:p-4 md:p-8 flex flex-col gap-4 sm:gap-6 md:gap-8 justify-center items-center">
        <header className="text-center p-4 sm:p-6 md:p-8 mb-2 sm:mb-4 bg-[#FF5E5B] border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-6xl w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black text-center tracking-tight">
            Ask Boundary Bytes
          </h1>
        </header>
        <div className="text-center -mt-2 sm:-mt-4 mb-1 sm:mb-2 w-full px-2 sm:px-0">
          <button className="bg-[#34D399] text-black font-bold py-2 sm:py-3 px-4 sm:px-6  border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all text-sm sm:text-base md:text-lg">
            Ask a cricket stats question - get instant numbers.
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 items-start w-full">
          <div className="lg:col-span-3 flex flex-col gap-4 sm:gap-6 md:gap-8">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-white border-2 border-black shadow-[4px_4px_0_#000] "
              aria-label="Cricket stats question form"
            >
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <label htmlFor="question" className="text-lg sm:text-xl font-bold">
                  Your Question
                </label>
                <Tooltip
                  side="top"
                  ariaLabel="Guidance for chat questions"
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">Quick Info</p>
                      <ul className="list-disc list-inside">
                        <li>This chat does not support very complex queries yet.</li>
                        <li>For matchup stats, try batter vs bowler format.</li>
                        <li>
                          Example: {'"'}Virat Kohli vs Jasprit Bumrah stats in IPL{'"'}
                        </li>
                        <li>Stats for specific bowling styles are not yet supported.</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onBlur={() => setTouched(true)}
                rows={4}
                maxLength={charLimit}
                placeholder="Example: Top 5 run scorers in WPL 2023"
                className="w-full p-3 sm:p-4 font-mono bg-[#FEF9C3] border-2 border-black  focus:outline-none focus:ring-2 focus:ring-black resize-none text-black text-sm sm:text-base"
                disabled={isPending}
                aria-invalid={showValidationError}
              />
              <div className="flex justify-between items-center text-xs sm:text-sm font-mono">
                <span className={question.length > charLimit ? 'text-red-600' : 'text-gray-500'}>
                  {question.length}/{charLimit}
                </span>
                {!selectedLeague && (
                  <span className="font-bold bg-[#FF9F1C] px-2 sm:px-3 py-1 border-2 border-black text-xs sm:text-sm">
                    Select a league first
                  </span>
                )}
              </div>
              {showValidationError && (
                <div
                  className="text-xs sm:text-sm font-bold text-black bg-[#FFED66] px-2 sm:px-3 py-2 border-2 border-black "
                  role="alert"
                >
                  Question must be 1-500 chars and only letters, numbers & basic punctuation.
                </div>
              )}
              <div className="flex gap-2 sm:gap-4 flex-wrap">
                <button
                  type="submit"
                  disabled={!isValid || isPending || !selectedLeague}
                  className={`py-2 sm:py-3 px-4 sm:px-6 md:px-8 border-2 border-black transition-all font-semibold text-sm sm:text-base ${
                    !isValid || !selectedLeague || isPending
                      ? 'bg-gray-400 text-white cursor-not-allowed shadow-none'
                      : 'bg-black text-white shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5'
                  }`}
                >
                  {isPending ? 'Fetching...' : 'Get Stats'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isPending && !data && !error}
                  className="py-2 sm:py-3 px-4 sm:px-6 md:px-8  border-2 border-black bg-white text-black shadow-[2px_2px_0_#000] hover:bg-[#FFED66] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-70 text-sm sm:text-base"
                >
                  Reset
                </button>
              </div>
            </form>

            {renderResult()}
          </div>
          <div className="lg:col-span-3 lg:sticky lg:top-4">{renderSuggestions()}</div>
        </div>
      </div>
    </div>
  );
}
