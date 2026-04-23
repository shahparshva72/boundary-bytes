import api from '@/services/api';
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

interface FeedbackStatsResponse {
  data?: unknown;
}

/**
 * Hook for submitting AI feedback
 */
export function useAiFeedback() {
  const submitFeedbackMutation = useMutation({
    mutationFn: async (params: SubmitFeedbackParams): Promise<FeedbackResponse> => {
      const response = await api.post('ai/feedback', {
        json: params,
        throwHttpErrors: false,
      });

      if (!response.ok) {
        const errorData: { error?: string } = await response
          .json<{ error?: string }>()
          .catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      return response.json<FeedbackResponse>();
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

const fetchAiFeedbackStats = async () => {
  return api.get('ai/feedback').json<FeedbackStatsResponse>();
};

/**
 * Hook for fetching AI feedback statistics
 */
export function useAiFeedbackStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-feedback-stats'],
    queryFn: fetchAiFeedbackStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    stats: data?.data,
    isLoading,
    error,
  };
}
