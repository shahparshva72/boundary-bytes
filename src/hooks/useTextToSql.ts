'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface TextToSqlSuccess {
  success: true;
  data: unknown[];
  metadata: {
    rowCount: number;
    executionTime: number;
    generatedSql: string;
  };
}

export interface TextToSqlError {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'AI_ERROR' | 'SQL_ERROR' | 'DATABASE_ERROR' | 'RATE_LIMIT_ERROR';
  suggestions?: string[];
  tips?: string[];
}

export type TextToSqlResponse = TextToSqlSuccess | TextToSqlError;

interface StreamMessage {
  message: string;
}

export function useTextToSql() {
  const [streamMessage, setStreamMessage] = useState<string | null>(null);
  const [result, setResult] = useState<TextToSqlSuccess | null>(null);
  const [error, setError] = useState<TextToSqlError | null>(null);

  const mutation = useMutation<void, Error, string>({
    mutationFn: async (question: string) => {
      setStreamMessage(null);
      setResult(null);
      setError(null);

      const res = await fetch('/api/text-to-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!res.body) {
        throw new Error('Response body is empty');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const eventMatch = line.match(/^event: (\w+)/);
            const dataMatch = line.match(/^data: (.*)/);

            if (eventMatch && dataMatch) {
              const event = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              switch (event) {
                case 'status':
                  setStreamMessage((data as StreamMessage).message);
                  break;
                case 'result':
                  setResult(data as TextToSqlSuccess);
                  break;
                case 'error':
                  setError(data.error as TextToSqlError);
                  break;
              }
            }
          }
        }
      };

      await processStream();
    },
    onSuccess: () => {
      // onSuccess logic can be handled here if needed
    },
    onError: (err) => {
      setError({
        success: false,
        error: err.message,
        code: 'DATABASE_ERROR', // Generic error, might need refinement
      });
    },
  });

  const reset = () => {
    setStreamMessage(null);
    setResult(null);
    setError(null);
    mutation.reset();
  };

  return {
    ...mutation,
    data: result,
    error,
    streamMessage,
    reset,
  };
}
