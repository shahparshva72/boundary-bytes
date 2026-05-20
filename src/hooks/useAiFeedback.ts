import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';

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
