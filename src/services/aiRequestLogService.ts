import { AiChatRequest } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

interface LogAiRequestParams {
  question: string;
  sanitizedQuestion?: string;
  league?: string;
  generatedSql?: string;
  rowCount?: number;
  executionTimeMs?: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

interface MarkAccuracyParams {
  requestId: string;
  isAccurate: boolean;
  feedbackNote?: string;
}

export class AiRequestLogService {
  /**
   * Log an AI chat request with all relevant metadata
   * Uses fire-and-forget pattern to avoid blocking the main response
   */
  async logRequest(params: LogAiRequestParams): Promise<string> {
    try {
      const request = await prisma.aiChatRequest.create({
        data: {
          question: params.question,
          sanitizedQuestion: params.sanitizedQuestion,
          league: params.league,
          generatedSql: params.generatedSql,
          rowCount: params.rowCount,
          executionTimeMs: params.executionTimeMs,
          success: params.success,
          errorCode: params.errorCode,
          errorMessage: params.errorMessage,
        },
      });

      return request.id;
    } catch (error) {
      // Log the error but don't throw - we don't want logging failures to affect user experience
      console.error('Failed to log AI request:', error);
      // Return a dummy ID that won't be used for feedback
      return 'log-failed-' + Date.now();
    }
  }

  /**
   * Mark a request as accurate or inaccurate with optional feedback note
   */
  async markAccuracy(params: MarkAccuracyParams): Promise<void> {
    const { requestId, isAccurate, feedbackNote } = params;

    try {
      await prisma.aiChatRequest.update({
        where: { id: requestId },
        data: {
          isAccurate,
          feedbackNote,
          feedbackAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to update request accuracy:', error);
      throw new Error('Failed to submit feedback');
    }
  }

  /**
   * Get a request by ID for debugging or admin purposes
   */
  async getRequestById(id: string): Promise<AiChatRequest | null> {
    try {
      return await prisma.aiChatRequest.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Failed to fetch request by ID:', error);
      return null;
    }
  }

  /**
   * Get recent requests for analytics or admin dashboard
   */
  async getRecentRequests(limit: number = 100): Promise<AiChatRequest[]> {
    try {
      return await prisma.aiChatRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Failed to fetch recent requests:', error);
      return [];
    }
  }

  /**
   * Get accuracy statistics
   */
  async getAccuracyStats(): Promise<{
    total: number;
    accurate: number;
    inaccurate: number;
    accuracyRate: number;
  }> {
    try {
      const total = await prisma.aiChatRequest.count({
        where: { isAccurate: { not: null } },
      });

      const accurate = await prisma.aiChatRequest.count({
        where: { isAccurate: true },
      });

      const inaccurate = await prisma.aiChatRequest.count({
        where: { isAccurate: false },
      });

      const accuracyRate = total > 0 ? (accurate / total) * 100 : 0;

      return {
        total,
        accurate,
        inaccurate,
        accuracyRate,
      };
    } catch (error) {
      console.error('Failed to fetch accuracy stats:', error);
      return { total: 0, accurate: 0, inaccurate: 0, accuracyRate: 0 };
    }
  }
}

// Export singleton instance
export const aiRequestLogService = new AiRequestLogService();
