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

    // Add context-specific suggestions
    const suggestions = this.generateSuggestions(code, errorMessage, context);
    if (suggestions.length > 0) {
      response.suggestions = suggestions;
    }

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
  private generateSuggestions(code: ErrorCode, errorMessage: string, context?: string): string[] {
    const suggestions: string[] = [];

    switch (code) {
      case 'VALIDATION_ERROR':
        suggestions.push(
          'Make sure your question contains only letters, numbers, and basic punctuation',
          'Keep your question under 500 characters',
          'Try asking about cricket statistics like "top run scorers" or "bowling figures"',
        );
        break;

      case 'AI_ERROR':
        suggestions.push(
          'Try rephrasing your cricket question more clearly',
          'Ask about specific players, teams, or statistics',
          'Example: "Who scored the most runs in WPL 2023?"',
          'Be specific about the season or tournament (e.g., "WPL 2023", "IPL 2024")',
        );
        break;

      case 'SQL_ERROR':
        if (errorMessage.toLowerCase().includes('player name')) {
          suggestions.push(
            'Try using just the last name (e.g., "Mandhana" instead of "Smriti Mandhana")',
            'Check the spelling of player names',
            'Make sure the player exists in our WPL database',
          );
        } else {
          suggestions.push(
            'Your question might be too complex - try breaking it into simpler parts',
            'Ask about one statistic at a time',
            "Make sure you're asking about cricket data that exists in our database",
          );
        }
        break;

      case 'DATABASE_ERROR':
        if (
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('no statistics')
        ) {
          suggestions.push(
            'Check if the player name or team name is spelled correctly',
            'Try using partial names (e.g., "Kohli" instead of "Virat Kohli")',
            'Ask about WPL players and teams specifically',
            "Try different seasons or tournaments that might have the data you're looking for",
          );
        } else if (
          errorMessage.toLowerCase().includes('connection') ||
          errorMessage.toLowerCase().includes('timeout')
        ) {
          suggestions.push(
            'There seems to be a temporary connection issue',
            'Please try again in a moment',
            'If the problem persists, try asking a simpler cricket question',
          );
        } else {
          suggestions.push(
            'Please try again in a moment',
            'If the problem persists, try asking a simpler cricket question',
            'Make sure your question is about cricket statistics we have in our database',
          );
        }
        break;

      case 'RATE_LIMIT_ERROR':
        suggestions.push(
          'Please wait a moment before asking another question',
          'You can ask up to 30 questions per minute',
          "Take your time to think about what cricket statistics you'd like to explore",
        );
        break;
    }

    // Add context-specific suggestions based on the original question
    if (context) {
      const contextLower = context.toLowerCase();
      if (contextLower.includes('player') && !contextLower.includes('wpl')) {
        suggestions.push('Make sure to ask about WPL players specifically');
      }
      if (contextLower.includes('team') && !contextLower.includes('wpl')) {
        suggestions.push(
          'Try asking about WPL teams like "Mumbai Indians" or "Royal Challengers Bangalore"',
        );
      }
    }

    // Add general cricket-specific suggestions if none were added
    if (suggestions.length === 0) {
      suggestions.push(
        'Try asking about cricket statistics like runs, wickets, or strike rates',
        'Example questions: "Top 5 batters in WPL", "Best bowling figures", "Team with most wins"',
        'Ask about specific players: "What is Smriti Mandhana\'s average?"',
        'Ask about team performance: "Which team won the most matches in WPL 2023?"',
      );
    }

    return suggestions;
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
      suggestions: [
        'Please try again in a moment',
        'If the problem persists, try asking a simpler cricket question',
        'Example: "Who are the top run scorers in WPL?"',
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
      suggestions: [
        'Try asking about fewer players or a shorter time period',
        'Break complex questions into simpler parts',
        'Example: Instead of "All player stats for all seasons", try "Top 5 run scorers in WPL 2023"',
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
      suggestions: [
        'Please wait a moment and try again',
        'The AI service should be back online shortly',
        'You can try asking your cricket question again in a few minutes',
      ],
    };
  }
}

// Export singleton instance
export const responseFormatter = new ResponseFormatter();
