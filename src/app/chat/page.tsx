'use client';

import Layout from '@/app/stats/components/Layout';
import AiFeedback from '@/components/AiFeedback';
import Tooltip from '@/components/ui/Tooltip';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { TextToSqlError, TextToSqlSuccess, useTextToSql } from '@/hooks/useTextToSql';
import { useEffect, useState } from 'react';
import { MoonLoader } from 'react-spinners';

type SuggestionSection = {
  category: string;
  color: string;
  queries: readonly string[];
};

const CHAR_LIMIT = 500;
const VALIDATION_REGEX = /^[a-zA-Z0-9\s?.,'"-]+$/;

const SUGGESTIONS: SuggestionSection[] = [
  {
    category: 'Player Stats',
    color: 'bg-[#4ECDC4]',
    queries: [
      'Virat Kohli runs in IPL 2023',
      'David Warner strike rate in BBL',
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
      'Best economy rate in SA20',
      'Highest strike rates in BBL',
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

function isTextToSqlError(e: unknown): e is TextToSqlError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'success' in e &&
    (e as { success: unknown }).success === false
  );
}

function formatDisplayValue(v: unknown): string {
  if (typeof v === 'number') {
    return v % 1 === 0 ? v.toString() : v.toFixed(2);
  }
  const num = Number(v as string);
  if (!isNaN(num)) {
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  }
  return String(v);
}

// -- Sub-components --

function splitColumns<T>(arr: T[], maxPerRow: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += maxPerRow) {
    result.push(arr.slice(i, i + maxPerRow));
  }
  return result;
}

type ResultGridProps = {
  data: unknown[];
};

function ResultGrid({ data }: ResultGridProps) {
  const rows = data as Record<string, unknown>[];
  const cols = Object.keys(rows[0]);
  const MAX_COLS_PER_ROW = 6;

  if (cols.length <= MAX_COLS_PER_ROW) {
    return (
      <div
        className="overflow-x-auto border-2 border-black"
        role="region"
        aria-label="Cricket statistics results"
      >
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#F9A825]">
              {cols.map((key) => (
                <th
                  key={key}
                  scope="col"
                  className="px-1.5 sm:px-2 md:px-3 py-1.5 border-2 border-black font-black text-left text-black whitespace-nowrap text-xs sm:text-sm md:text-base"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FEF9C3]'}>
                {cols.map((key) => (
                  <td
                    key={key}
                    className="px-1.5 sm:px-2 md:px-3 py-1.5 border-2 border-black font-mono text-xs sm:text-sm text-black whitespace-nowrap max-w-[120px] sm:max-w-[180px] md:max-w-[240px] overflow-hidden text-ellipsis"
                    title={String(row[key])}
                  >
                    {formatDisplayValue(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const colGroups = splitColumns(cols, MAX_COLS_PER_ROW);

  return (
    <div className="border-2 border-black" role="region" aria-label="Cricket statistics results">
      <div className="flex flex-col gap-6 p-2 sm:p-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-col gap-2">
            {colGroups.map((group, gi) => (
              <div
                key={gi}
                className={`grid border-2 border-black ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FEF9C3]'}`}
                style={{ gridTemplateColumns: `repeat(${group.length}, minmax(0, 1fr))` }}
              >
                {group.map((key) => (
                  <div key={key} className="flex flex-col border-r border-black last:border-r-0">
                    <span className="bg-[#F9A825] px-1.5 sm:px-2 py-1 font-black text-black text-xs sm:text-sm border-b border-black">
                      {key}
                    </span>
                    <span className="px-1.5 sm:px-2 py-1 font-mono text-xs sm:text-sm text-black">
                      {formatDisplayValue(row[key])}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type QueryResultProps = {
  isPending: boolean;
  showSlowMsg: boolean;
  error: unknown;
  data: TextToSqlSuccess | null;
  onReset: () => void;
  onSuggestionClick: (suggestion: string) => void;
};

function QueryResult({
  isPending,
  showSlowMsg,
  error,
  data,
  onReset,
  onSuggestionClick,
}: QueryResultProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-2.5 p-2 sm:p-3 md:p-4 bg-white border-2 border-black shadow-[2px_2px_0_#000]">
        <MoonLoader color="#1a202c" size={48} />
        <p className="font-bold text-center text-base sm:text-lg text-black">
          Crunching the numbers...
        </p>
        {showSlowMsg && (
          <p className="text-xs sm:text-sm font-mono bg-[#FFED66] px-2 sm:px-3 py-2 border-2 border-black text-black">
            Big over of data - hang tight!
          </p>
        )}
      </div>
    );
  }

  if (error) {
    const structured = isTextToSqlError(error) ? error : null;
    console.error('Text-to-SQL error:', error);

    return (
      <div
        className="p-2 sm:p-3 md:p-4 bg-[#FF5E5B] border-2 border-black shadow-[2px_2px_0_#000] flex flex-col gap-2 sm:gap-2.5"
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
          <span className="inline-block bg-[#FFED66] px-2 sm:px-3 py-1 font-bold border-2 border-black w-fit text-sm sm:text-base text-black">
            Rate limit - give it a moment
          </span>
        )}
        {structured?.tips && structured.tips.length > 0 && (
          <ul className="list-disc list-inside bg-[#FFFEE0] border-2 border-black p-2 sm:p-3 font-mono text-xs sm:text-sm text-black">
            {structured.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}
        {structured?.suggestions && structured.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {structured.suggestions.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="text-black text-xs sm:text-sm bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 border-2 border-black font-bold shadow-[1px_1px_0_#000] hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={onReset}
          className="self-start mt-1 bg-white px-2 sm:px-3 py-1.5 font-bold border-2 border-black text-black text-xs sm:text-sm shadow-[1px_1px_0_#000] hover:bg-[#FFED66] hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          Clear
        </button>
      </div>
    );
  }

  if (data) {
    return (
      <div
        className="p-2 sm:p-3 md:p-4 bg-white border-2 border-black shadow-[2px_2px_0_#000] flex flex-col gap-2 sm:gap-3"
        aria-live="polite"
      >
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          <span className="bg-[#4ECDC4] px-2 sm:px-3 py-0.5 sm:py-1 border-2 border-black font-black text-black text-xs sm:text-sm">
            Rows: {data.metadata.rowCount}
          </span>
        </div>
        {data.metadata.rowCount === 0 ? (
          <p className="font-mono text-black text-sm sm:text-base">
            No stats found - try another angle (e.g. &quot;Top run scorers in WPL 2023&quot;).
          </p>
        ) : (
          <ResultGrid data={data.data} />
        )}
        <div className="flex gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onReset}
            className="bg-[#FF5E5B] px-2 sm:px-3 py-1.5 font-black border-2 border-black text-xs sm:text-sm text-black shadow-[1px_1px_0_#000] hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            Ask Another
          </button>
        </div>
        {data.requestId && <AiFeedback requestId={data.requestId} />}
      </div>
    );
  }

  return null;
}

type QuerySuggestionsProps = {
  onQueryClick: (query: string) => void;
};

function QuerySuggestions({ onQueryClick }: QuerySuggestionsProps) {
  return (
    <div className="p-2 sm:p-3 bg-white border-2 border-black shadow-[2px_2px_0_#000] flex flex-col gap-2 sm:gap-3">
      <h3 className="text-lg sm:text-xl md:text-2xl text-black text-center flex items-center justify-center">
        <span className="text-base sm:text-lg md:text-xl mr-1.5">💡</span>
        Query Suggestions
      </h3>
      <p className="font-mono text-black text-center text-xs sm:text-sm">
        Click any suggestion to try it out, or use them as inspiration for your own questions!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {SUGGESTIONS.map((section) => (
          <div key={section.category} className="flex flex-col">
            <h4
              className={`${section.color} text-black text-center text-lg sm:text-xl md:text-2xl font-bold py-2 sm:py-3 border-2 border-black shadow-[2px_2px_0_#000]`}
            >
              {section.category}
            </h4>
            <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-2.5 bg-white border-2 border-black shadow-[1px_1px_0_#000] border-t-0">
              {section.queries.map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => onQueryClick(query)}
                  className="w-full text-black text-left p-1.5 sm:p-2 bg-gray-100 border-2 border-black shadow-[1px_1px_0_#000] text-xs sm:text-sm font-mono hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  {`"${query}"`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 sm:mt-2 p-2 sm:p-2.5 bg-[#FCD34D] border-2 border-black shadow-[1px_1px_0_#000] flex items-center justify-center">
        <span className="text-base sm:text-lg mr-1.5 sm:mr-2">✨</span>
        <p className="font-semibold text-black text-xs sm:text-sm text-center">
          Pro Tip: Try asking about specific seasons (e.g., &quot;IPL 2023&quot;), player
          comparisons, or team performance!
        </p>
      </div>
    </div>
  );
}

// -- Page --

export default function TextToSqlPage() {
  const { selectedLeague } = useLeagueContext();
  const { mutate, data, error, isPending, reset } = useTextToSql();
  const [question, setQuestion] = useState('');
  const [touched, setTouched] = useState(false);
  const [showSlowMsg, setShowSlowMsg] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setShowSlowMsg(false);
      return;
    }
    const id = setTimeout(() => setShowSlowMsg(true), 2000);
    return () => clearTimeout(id);
  }, [isPending]);

  const isValid =
    question.length > 0 && question.length <= CHAR_LIMIT && VALIDATION_REGEX.test(question);
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

  return (
    <Layout
      title="Ask Boundary Bytes"
      description="Ask a cricket stats question - get instant numbers."
    >
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 items-start w-full">
        <div className="lg:col-span-3 flex flex-col gap-2 sm:gap-3 md:gap-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 sm:gap-2.5 p-2 sm:p-3 md:p-4 bg-white border-2 border-black shadow-[2px_2px_0_#000]"
            aria-label="Cricket stats question form"
          >
            <div className="flex flex-wrap items-center gap-1.5 mb-1 sm:mb-1.5">
              <label htmlFor="question" className="text-base sm:text-lg font-bold text-black">
                Your Question
              </label>
              <Tooltip
                side="top"
                ariaLabel="Guidance for chat questions"
                content={
                  <div className="space-y-1 text-black">
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
              maxLength={CHAR_LIMIT}
              placeholder="Example: Top 5 run scorers in WPL 2023"
              className="w-full p-2 sm:p-2.5 font-mono bg-[#FEF9C3] border-2 border-black focus:outline-none focus:ring-2 focus:ring-black resize-none text-black text-sm sm:text-base"
              disabled={isPending}
              aria-invalid={showValidationError}
            />
            <div className="flex justify-between items-center text-xs sm:text-sm font-mono">
              <span className={question.length > CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'}>
                {question.length}/{CHAR_LIMIT}
              </span>
              {!selectedLeague && (
                <span className="font-bold bg-[#FF9F1C] px-2 sm:px-3 py-1 border-2 border-black text-xs sm:text-sm text-black">
                  Select a league first
                </span>
              )}
            </div>
            {showValidationError && (
              <div
                className="text-xs sm:text-sm font-bold text-black bg-[#FFED66] px-2 sm:px-3 py-2 border-2 border-black"
                role="alert"
              >
                Question must be 1-500 chars and only letters, numbers & basic punctuation.
              </div>
            )}
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              <button
                type="submit"
                disabled={!isValid || isPending || !selectedLeague}
                className={`py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 border-2 border-black transition-all font-semibold text-xs sm:text-sm ${
                  !isValid || !selectedLeague || isPending
                    ? 'bg-gray-400 text-white cursor-not-allowed shadow-none'
                    : 'bg-black text-white shadow-[1px_1px_0_#000] hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5'
                }`}
              >
                {isPending ? 'Fetching...' : 'Get Stats'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending && !data && !error}
                className="py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 border-2 border-black bg-white text-black shadow-[1px_1px_0_#000] hover:bg-[#FFED66] hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-70 text-xs sm:text-sm"
              >
                Reset
              </button>
            </div>
          </form>
          <QueryResult
            isPending={isPending}
            showSlowMsg={showSlowMsg}
            error={error}
            data={data ?? null}
            onReset={handleReset}
            onSuggestionClick={setQuestion}
          />
        </div>
        <div className="lg:col-span-3 lg:sticky lg:top-4">
          <QuerySuggestions onQueryClick={setQuestion} />
        </div>
      </div>
    </Layout>
  );
}
