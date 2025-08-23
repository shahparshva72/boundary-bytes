'use client';

import { useState, useEffect } from 'react';
import { useTextToSql } from '@/hooks/useTextToSql';
import { MoonLoader } from 'react-spinners';
import { useLeagueContext } from '@/contexts/LeagueContext';

export default function TextToSqlPage() {
  const { selectedLeague } = useLeagueContext();
  const { mutate, data, error, isPending, reset } = useTextToSql();
  const [question, setQuestion] = useState('');
  const [touched, setTouched] = useState(false);
  const [showSlowMsg, setShowSlowMsg] = useState(false);

  // Delay message after 2 seconds of loading
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
    if (!isValid || !selectedLeague) return;
    mutate(question);
  };

  const handleReset = () => {
    setQuestion('');
    reset();
    setTouched(false);
  };

  const renderResult = () => {
    if (isPending) {
      return (
        <div className="flex flex-col items-center gap-4 p-8 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <MoonLoader color="#1a202c" size={48} />
          <p className="font-bold text-black text-center text-lg">Crunching the numbers...</p>
          {showSlowMsg && (
            <p className="text-sm font-mono bg-[#FFED66] px-3 py-2 border-2 border-black">
              Big over of data – hang tight!
            </p>
          )}
        </div>
      );
    }

    // Type guard function for better type safety
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
      // Log the full error details for debugging but avoid surfacing internal / validation specifics to the user
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('Text-to-SQL error:', error);
      }
      return (
        <div
          className="p-8 bg-[#FF5E5B] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4"
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-2xl font-black text-black">Unable to fetch stats</h3>
          <p className="font-mono text-black">
            Something went wrong while processing that question. Please try again or tweak your
            phrasing.
          </p>
          {structured?.code === 'RATE_LIMIT_ERROR' && (
            <span className="inline-block bg-[#FFED66] px-3 py-1 font-bold border-2 border-black w-fit">
              Rate limit – give it a moment ⚡
            </span>
          )}
          {structured?.suggestions && structured.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {structured.suggestions.slice(0, 4).map((s: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuestion(s)}
                  className="text-sm bg-white px-3 py-2 border-2 border-black font-bold hover:bg-[#4ECDC4] transition-colors"
                >
                  {s.replace(/"/g, '&quot;')}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="self-start mt-2 bg-white px-4 py-2 font-bold border-2 border-black hover:bg-[#FFED66]"
          >
            Clear
          </button>
        </div>
      );
    }

    if (data) {
      return (
        <div
          className="p-8 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <span className="bg-[#4ECDC4] px-4 py-2 border-2 border-black font-black text-black">
              Rows: {data.metadata.rowCount}
            </span>
            <span className="bg-[#FFED66] px-4 py-2 border-2 border-black font-black text-black">
              Time: {data.metadata.executionTime}ms
            </span>
          </div>
          {data.metadata.rowCount === 0 ? (
            <p className="font-mono text-black">
              No stats found – try another angle (e.g. &quot;Top run scorers in WPL 2023&quot;).
            </p>
          ) : (
            <div
              className="overflow-x-auto border-4 border-black"
              role="region"
              aria-label="Cricket statistics results"
            >
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#FF9F1C]">
                    {Object.keys(data.data[0] as Record<string, unknown>).map((key) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-4 py-2 border-2 border-black font-black text-left text-black whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]'}>
                      {Object.entries(row as Record<string, unknown>).map(([k, v]) => (
                        <td
                          key={k}
                          className="px-4 py-2 border-2 border-black font-mono text-sm text-black whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis"
                          title={String(v)}
                        >
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="bg-[#FF5E5B] px-4 py-2 font-black border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Ask Another
            </button>
          </div>
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
      <div className="p-6 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
        <h3 className="text-2xl font-black text-black text-center">💡 Query Suggestions</h3>
        <p className="font-mono text-black text-center text-sm">
          Click any suggestion to try it out, or use them as inspiration for your own questions!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((section, sectionIdx) => (
            <div key={sectionIdx} className="flex flex-col gap-3">
              <h4
                className={`${section.color} px-4 py-2 border-2 border-black font-black text-black text-center`}
              >
                {section.category}
              </h4>
              <div className="flex flex-col gap-2">
                {section.queries.map((query, queryIdx) => (
                  <button
                    key={queryIdx}
                    type="button"
                    onClick={() => setQuestion(query)}
                    className="text-left text-sm bg-white px-3 py-2 border-2 border-black font-mono hover:bg-[#FFFEE0] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    {`"${query.replace(/"/g, '&quot;')}"`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#FFFEE0] border-2 border-black p-4">
          <p className="font-bold text-black text-sm text-center">
            🏏 Pro Tip: Try asking about specific seasons (e.g., &quot;IPL 2023&quot;), player
            comparisons, or team performance!
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFEE0] p-4 sm:p-8 flex flex-col gap-8 text-black">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-10">
        <header className="flex flex-col gap-4 items-center">
          <div className="bg-[#FF5E5B] p-6 sm:p-8 w-full text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">
              Ask Boundary Bytes
            </h1>
          </div>
          <p className="font-bold text-black bg-[#4ECDC4] px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            Ask a cricket stats question – get instant numbers.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-6 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Cricket stats question form"
        >
          <label htmlFor="question" className="font-black text-xl text-black">
            Your Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={4}
            maxLength={charLimit}
            placeholder="Example: Top 5 run scorers in WPL 2023"
            className="w-full p-4 font-mono border-4 border-black bg-[#FFED66] focus:outline-none focus:ring-4 focus:ring-black resize-none text-black"
            disabled={isPending}
            aria-invalid={showValidationError}
          />
          <div className="flex justify-between items-center text-sm font-mono">
            <span className={question.length > charLimit ? 'text-red-600' : 'text-black'}>
              {question.length}/{charLimit}
            </span>
            {!selectedLeague && (
              <span className="font-bold bg-[#FF9F1C] px-3 py-1 border-2 border-black">
                Select a league first
              </span>
            )}
          </div>
          {showValidationError && (
            <div
              className="text-sm font-bold text-black bg-[#FFED66] px-3 py-2 border-2 border-black"
              role="alert"
            >
              Question must be 1–500 chars and only letters, numbers & basic punctuation.
            </div>
          )}
          <div className="flex gap-4 flex-wrap">
            <button
              type="submit"
              disabled={!isValid || isPending || !selectedLeague}
              className={`px-6 py-3 font-black border-4 border-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                !isValid || !selectedLeague || isPending
                  ? 'bg-gray-300 cursor-not-allowed text-black'
                  : 'bg-[#FF5E5B] text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {isPending ? 'Fetching...' : 'Get Stats'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending && !data && !error}
              className="px-6 py-3 font-black border-4 border-black bg-white hover:bg-[#FFED66] transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Reset
            </button>
          </div>
        </form>

        {renderResult()}

        {renderSuggestions()}
      </div>
    </div>
  );
}
