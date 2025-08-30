// Response formatting utilities for text-to-SQL API

export interface SuccessResponse {
  success: true;
  data: unknown[];
  metadata: {
    rowCount: number;
    executionTime: number;
    generatedSql: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  suggestions?: string[];
  tips?: string[];
  code: ErrorCode;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AI_ERROR'
  | 'SQL_ERROR'
  | 'DATABASE_ERROR'
  | 'RATE_LIMIT_ERROR';

export type ApiResponse = SuccessResponse | ErrorResponse;

export class ResponseFormatter {
  /**
   * Formats successful query results with metadata
   */
  formatResults(data: unknown[], sql: string, executionTime: number): SuccessResponse {
    return {
      success: true,
      data: data || [],
      metadata: {
        rowCount: data?.length || 0,
        executionTime,
        generatedSql: sql,
      },
    };
  }

  /**
   * Formats error responses with user-friendly messages
   */
  formatError(error: Error | string, code: ErrorCode, context?: string): ErrorResponse {
    const errorMessage = typeof error === 'string' ? error : error.message;

    const response: ErrorResponse = {
      success: false,
      error: this.sanitizeErrorMessage(errorMessage),
      code,
    };

    const { suggestions, tips } = this.generateSuggestions(code, errorMessage, context);
    if (suggestions.length > 0) response.suggestions = suggestions;
    if (tips.length > 0) response.tips = tips;

    return response;
  }

  /**
   * Handles empty result sets with helpful suggestions
   */
  formatEmptyResults(
    sql: string,
    originalQuestion: string,
    executionTime: number,
  ): SuccessResponse {
    return {
      success: true,
      data: [],
      metadata: {
        rowCount: 0,
        executionTime,
        generatedSql: sql,
      },
    };
  }

  /**
   * Sanitizes error messages to avoid exposing internal details
   */
  private sanitizeErrorMessage(message: string): string {
    // Remove any potential sensitive information
    const sanitized = message
      .replace(/database\s+connection/gi, 'connection')
      .replace(/prisma/gi, 'database')
      .replace(/postgresql/gi, 'database')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[server]') // Remove IP addresses
      .replace(/password/gi, '[credentials]')
      .replace(/token/gi, '[credentials]');

    return sanitized;
  }

  /**
   * Generates helpful suggestions based on error type and context
   */
  private generateSuggestions(
    code: ErrorCode,
    errorMessage: string,
    context?: string,
  ): { suggestions: string[]; tips: string[] } {
    const suggestions: string[] = [];
    const tips: string[] = [];

    switch (code) {
      case 'VALIDATION_ERROR':
        tips.push(
          'Make sure your question contains only letters, numbers, and basic punctuation',
          'Keep your question under 500 characters',
          'Try asking about cricket statistics like top run scorers or bowling figures',
        );
        suggestions.push('Top run scorers in WPL 2023', 'Best bowling figures in WPL 2023');
        break;

      case 'AI_ERROR':
        tips.push(
          'Try rephrasing your cricket question more clearly',
          'Ask about specific players, teams, or statistics',
          'Be specific about the season or tournament such as WPL 2023 or IPL 2024',
        );
        suggestions.push('Who scored the most runs in WPL 2023?');
        break;

      case 'SQL_ERROR':
        if (errorMessage.toLowerCase().includes('player name')) {
          tips.push(
            'Try using just the last name such as Mandhana instead of Smriti Mandhana',
            'Check the spelling of player names',
            'Make sure the player exists in the WPL database',
          );
          suggestions.push("Smriti Mandhana's average in WPL 2023");
        } else {
          tips.push(
            'Your question might be too complex, try breaking it into simpler parts',
            'Ask about one statistic at a time',
            'Make sure you are asking about cricket data that exists in the database',
          );
          suggestions.push('Top 5 strike rates in WPL 2023');
        }
        break;

      case 'DATABASE_ERROR':
        if (
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('no statistics')
        ) {
          tips.push(
            'Check if the player name or team name is spelled correctly',
            'Try using partial names such as Kohli instead of Virat Kohli',
            'Ask about WPL players and teams specifically',
            'Try different seasons or tournaments that might have the data you are looking for',
          );
          suggestions.push('Team with most wins in WPL 2023');
        } else if (
          errorMessage.toLowerCase().includes('connection') ||
          errorMessage.toLowerCase().includes('timeout')
        ) {
          tips.push(
            'There seems to be a temporary connection issue',
            'Please try again in a moment',
            'If the problem persists, try asking a simpler cricket question',
          );
        } else {
          tips.push(
            'Please try again in a moment',
            'If the problem persists, try asking a simpler cricket question',
            'Make sure your question is about cricket statistics present in the database',
          );
          suggestions.push('Best bowling economy in WPL 2023');
        }
        break;

      case 'RATE_LIMIT_ERROR':
        tips.push(
          'Please wait a moment before asking another question',
          'You can ask up to 30 questions per minute',
          'Take your time to think about what cricket statistics you would like to explore',
        );
        break;
    }

    if (context) {
      const contextLower = context.toLowerCase();
      if (contextLower.includes('player') && !contextLower.includes('wpl')) {
        tips.push('Make sure to ask about WPL players specifically');
      }
      if (contextLower.includes('team') && !contextLower.includes('wpl')) {
        tips.push('Try asking about WPL teams like Mumbai Indians or Royal Challengers Bangalore');
      }
    }

    if (suggestions.length === 0) {
      tips.push('Try asking about cricket statistics like runs, wickets, or strike rates');
      suggestions.push(
        'Top 5 batters in WPL',
        'Best bowling figures in WPL',
        'Which team won the most matches in WPL 2023?',
      );
    }

    return { suggestions, tips };
  }

  /**
   * Formats validation errors from Zod
   */
  formatValidationError(zodError: { errors?: Array<{ message?: string }> }): ErrorResponse {
    const firstError = zodError.errors?.[0];
    const message = firstError?.message || 'Invalid request format';

    return this.formatError(message, 'VALIDATION_ERROR');
  }

  /**
   * Creates a generic server error response
   */
  formatServerError(): ErrorResponse {
    return {
      success: false,
      error:
        'An unexpected error occurred while processing your cricket question. Please try again.',
      code: 'DATABASE_ERROR',
      suggestions: ['Who are the top run scorers in WPL?'],
      tips: [
        'Please try again in a moment',
        'If the problem persists, try asking a simpler cricket question',
      ],
    };
  }

  /**
   * Formats timeout-specific errors
   */
  formatTimeoutError(originalQuestion?: string): ErrorResponse {
    return {
      success: false,
      error: 'Your cricket question took too long to process. Please try a simpler question.',
      code: 'DATABASE_ERROR',
      suggestions: ['Top 5 run scorers in WPL 2023'],
      tips: [
        'Try asking about fewer players or a shorter time period',
        'Break complex questions into simpler parts',
        originalQuestion
          ? `Original question: "${originalQuestion}"`
          : 'Try rephrasing your question',
      ],
    };
  }

  /**
   * Formats AI model unavailable errors
   */
  formatAiUnavailableError(): ErrorResponse {
    return {
      success: false,
      error: 'The AI service is temporarily unavailable. Please try again in a moment.',
      code: 'AI_ERROR',
      tips: [
        'Please wait a moment and try again',
        'The AI service should be back online shortly',
        'You can try asking your cricket question again in a few minutes',
      ],
    };
  }
}

// Export singleton instance
export const responseFormatter = new ResponseFormatter();
