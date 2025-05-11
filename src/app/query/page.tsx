'use client';

import { useState } from 'react';

export default function QueryPage() {
  // no manual SQL state: direct AI execution only
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // we only track AI/thinking and loading states

  // Input state for natural language query
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);

  // Custom function to handle natural language query submission
  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsAiLoading(true);
    setError(null);

    try {
      // Add user message to the chat
      const newMessages = [...messages, { role: 'user', content: input }];
      setMessages(newMessages);

      // Make API request to generate SQL
      const response = await fetch('/api/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process question');
      }

      // Add AI response to messages
      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      
      // Execute the AI-generated SQL directly
      await executeQuery(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Example natural language queries for users to try
  const exampleNaturalQueries = [
    'Show me all matches from the 2024/25 season',
    'Who scored the most runs in the tournament?',
    'List the top 10 bowlers with the most wickets',
    'How many matches were played in Mumbai?',
    'What was the highest team score in an innings?',
    'How many runs did Harmanpreet Kaur score?',
    'Show me the strike rate for Smriti Mandhana',
    'What is the economy rate of the best bowlers?'
  ];


  // Set example natural language query
  const setExampleNaturalQuery = (exampleQuery: string) => {
    setInput(exampleQuery);
  };

  
  // Reusable function to execute a SQL query
  const executeQuery = async (queryToExecute: string) => {
    if (!queryToExecute.trim()) {
      setError("Oops, there was an error fetching stats or they don't exist");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryToExecute }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }

      setResults(data.results);
    } catch (err) {
      setError("Oops, there was an error fetching stats or they don't exist");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Function to render table headers from the first result
  const renderTableHeaders = () => {
    if (!results || results.length === 0) return null;

    const headers = Object.keys(results[0]);

    return (
      <thead className="bg-gray-100 border-b-2 border-gray-200">
        <tr>
          {headers.map((header) => (
            <th key={header} className="p-3 text-sm font-semibold tracking-wide text-left text-black">
              {header}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  // Function to render table rows
  const renderTableRows = () => {
    if (!results || results.length === 0) return null;

    return (
      <tbody>
        {results.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {Object.values(row).map((value: any, colIndex) => (
              <td key={colIndex} className="p-3 text-sm text-black">
                {value === null ? 'NULL' :
                 typeof value === 'object' ? JSON.stringify(value) :
                 String(value)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-[#FFFEE0]">
      <div className="max-w-6xl mx-auto my-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="bg-[#FF5E5B] p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
            <h1 className="text-4xl font-black text-black text-center tracking-tight">CRICKET QUERY EXPLORER</h1>
          </div>
          <p className="text-xl font-bold text-black bg-[#4ECDC4] px-6 py-3 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Ask questions about cricket data in natural language
          </p>
        </div>


        {/* Natural Language Query Form */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
          <form onSubmit={handleNaturalLanguageSubmit} className="space-y-4">
            <div>
              <label htmlFor="natural-query" className="block text-lg font-bold mb-2 text-black">
                Ask a question about cricket data:
              </label>
              <textarea
                id="natural-query"
                value={input}
                onChange={handleInputChange}
                className="w-full h-40 p-4 border-2 border-black text-sm text-black"
                placeholder="Example: Who scored the most runs in the 2024/25 season?"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <p className="w-full font-bold text-black">Example questions:</p>
              {exampleNaturalQueries.map((exampleQuery, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setExampleNaturalQuery(exampleQuery)}
                  className="px-3 py-1 text-sm bg-gray-100 border-2 border-black hover:bg-gray-200 text-black"
                >
                  Example {index + 1}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isAiLoading || isLoading}
              className="px-6 py-3 bg-[#FF5E5B] font-bold border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
            >
              {isAiLoading
                ? 'Thinking...'
                : isLoading
                  ? 'Loading...'
                  : 'Ask Question'}
            </button>
          </form>
        </div>


        {/* Results or Error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
            <p className="font-bold text-black">Error</p>
            <p className="text-black">{error}</p>
          </div>
        )}

        {results && (
          <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold mb-4 text-black">Query Results ({results.length} rows)</h2>

            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  {renderTableHeaders()}
                  {renderTableRows()}
                </table>
              </div>
            ) : (
              <p className="text-black">No results returned</p>
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#4ECDC4] font-bold border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
