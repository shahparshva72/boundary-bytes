'use client';

import { useMutation } from '@tanstack/react-query';

interface TextToSqlSuccess {
  success: true;
  data: unknown[];
  metadata: {
    rowCount: number;
    executionTime: number;
    generatedSql: string; // retained for potential future enhancements
  };
  requestId?: string; // For feedback tracking
}

export interface TextToSqlError {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'AI_ERROR' | 'SQL_ERROR' | 'DATABASE_ERROR' | 'RATE_LIMIT_ERROR';
  suggestions?: string[];
  tips?: string[];
}

export type TextToSqlResponse = TextToSqlSuccess | TextToSqlError;

export function useTextToSql() {
  return useMutation<TextToSqlSuccess, TextToSqlError | Error, string>({
    mutationFn: async (question: string) => {
      const res = await fetch('/api/text-to-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      let json: TextToSqlResponse;
      try {
        json = (await res.json()) as TextToSqlResponse;
      } catch {
        throw new Error('Invalid server response');
      }

      if (!res.ok || !json.success) {
        throw json as TextToSqlError;
      }
      return json as TextToSqlSuccess;
    },
    retry: (failureCount, error) => {
      if ((error as TextToSqlError)?.success === false) return false;
      return failureCount < 2;
    },
  });
}
