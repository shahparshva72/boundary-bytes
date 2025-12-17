import { useMutation, useQuery } from '@tanstack/react-query';

interface SubmitFeedbackParams {
  requestId: string;
  isAccurate: boolean;
  feedbackNote?: string;
}

interface FeedbackResponse {
  success: boolean;
  message: string;
}

/**
 * Hook for submitting AI feedback
 */
export function useAiFeedback() {
  const submitFeedbackMutation = useMutation({
    mutationFn: async (params: SubmitFeedbackParams): Promise<FeedbackResponse> => {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      return response.json();
    },
  });

  const submitFeedback = (params: SubmitFeedbackParams) => {
    submitFeedbackMutation.mutate(params);
  };

  return {
    submitFeedback,
    isSubmitting: submitFeedbackMutation.isPending,
    isSuccess: submitFeedbackMutation.isSuccess,
    error: submitFeedbackMutation.error,
  };
}

/**
 * Hook for fetching AI feedback statistics
 */
export function useAiFeedbackStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-feedback-stats'],
    queryFn: async () => {
      const response = await fetch('/api/ai/feedback', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback statistics');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    stats: data?.data,
    isLoading,
    error,
  };
}
