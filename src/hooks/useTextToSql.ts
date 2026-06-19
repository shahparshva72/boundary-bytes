'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export interface RateLimitInfo {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string;
}

export interface TextToSqlSuccess {
  success: true;
  data: unknown[];
  metadata: {
    rowCount: number;
    executionTime: number;
    generatedSql: string;
  };
  requestId?: string;
  rateLimit?: RateLimitInfo;
}

export interface TextToSqlError {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'AI_ERROR' | 'SQL_ERROR' | 'DATABASE_ERROR' | 'RATE_LIMIT_ERROR';
  suggestions?: string[];
  tips?: string[];
  rateLimit?: RateLimitInfo;
}

export type TextToSqlResponse = TextToSqlSuccess | TextToSqlError;

export const TEXT_TO_SQL_LIMITS_KEY = ['text-to-sql-limits'] as const;

export function useTextToSqlLimits() {
  return useQuery({
    queryKey: TEXT_TO_SQL_LIMITS_KEY,
    queryFn: async () => {
      const json = await api
        .get('text-to-sql/limits', { throwHttpErrors: false })
        .json<{ success: boolean; rateLimit: RateLimitInfo }>();
      return json.rateLimit;
    },
    staleTime: 30_000,
  });
}

export function useTextToSql() {
  const queryClient = useQueryClient();

  return useMutation<TextToSqlSuccess, TextToSqlError | Error, string>({
    mutationFn: async (question: string) => {
      let json: TextToSqlResponse;
      try {
        json = await api
          .post('text-to-sql', {
            json: { question },
            throwHttpErrors: false,
          })
          .json<TextToSqlResponse>();
      } catch {
        throw new Error('Invalid server response');
      }

      if (!json.success) {
        throw json as TextToSqlError;
      }
      return json as TextToSqlSuccess;
    },
    onSuccess: (data) => {
      if (data.rateLimit) {
        queryClient.setQueryData(TEXT_TO_SQL_LIMITS_KEY, data.rateLimit);
      } else {
        void queryClient.invalidateQueries({ queryKey: TEXT_TO_SQL_LIMITS_KEY });
      }
    },
    onError: (error) => {
      const structured = error as TextToSqlError;
      if (structured?.rateLimit) {
        queryClient.setQueryData(TEXT_TO_SQL_LIMITS_KEY, structured.rateLimit);
      }
    },
    retry: (failureCount, error) => {
      if ((error as TextToSqlError)?.success === false) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
