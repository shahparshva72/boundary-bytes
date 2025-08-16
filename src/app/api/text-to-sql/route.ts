import { NextRequest, NextResponse } from 'next/server';
import { validateTextToSqlRequest, sanitizeInput } from '@/lib/validation/text-to-sql';
import { sqlValidator } from '@/lib/sql-validator';
import { geminiSqlService } from '@/services/gemini-sql';
import { cricketQueryService } from '@/services/cricket-query';
import { responseFormatter } from '@/lib/response-formatter';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body: any = null;

  try {
    // Parse request body
    body = await request.json();
    logger.debug('Received text-to-SQL request', { body });

    // Quick health check - ensure all required environment variables are present
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      logger.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
      return NextResponse.json(
        responseFormatter.formatError('AI service configuration error', 'AI_ERROR'),
        { status: 503 },
      );
    }

    // Validate input
    const validation = validateTextToSqlRequest(body);
    if (!validation.success) {
      logger.warn('Input validation failed', { error: validation.error, body });
      return NextResponse.json(
        responseFormatter.formatError(validation.error, 'VALIDATION_ERROR'),
        { status: 400 },
      );
    }

    // Sanitize the input question
    const sanitizedQuestion = sanitizeInput(validation.data.question);
    logger.info('Processing cricket question', {
      originalQuestion: validation.data.question,
      sanitizedQuestion,
    });

    // Generate SQL using Gemini AI
    let generatedQueries: string[];
    try {
      logger.debug('Generating SQL with Gemini AI', { question: sanitizedQuestion });
      generatedQueries = await geminiSqlService.generateSql(sanitizedQuestion);
      logger.info('SQL generated successfully', { queries: generatedQueries });
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error('Gemini AI generation failed', {
        error: errorMessage,
        question: sanitizedQuestion,
      });

      // Handle specific AI errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        return NextResponse.json(
          responseFormatter.formatError(
            'AI service rate limit exceeded. Please try again in a moment.',
            'RATE_LIMIT_ERROR',
          ),
          { status: 429 },
        );
      } else if (errorMessage.includes('unavailable') || errorMessage.includes('service')) {
        return NextResponse.json(responseFormatter.formatAiUnavailableError(), { status: 503 });
      } else {
        return NextResponse.json(
          responseFormatter.formatError(error as Error, 'AI_ERROR', sanitizedQuestion),
          { status: 500 },
        );
      }
    }

    // Validate each generated SQL query
    logger.debug('Validating generated SQL queries', { queryCount: generatedQueries.length });
    for (const query of generatedQueries) {
      const sqlValidation = sqlValidator.validateSql(query);
      if (!sqlValidation.isValid) {
        logger.warn('SQL validation failed', { query, errors: sqlValidation.errors });
        return NextResponse.json(
          responseFormatter.formatError(
            `Generated query failed security validation: ${sqlValidation.errors.join(', ')}`,
            'SQL_ERROR',
          ),
          { status: 400 },
        );
      }
    }

    // Validate sequential queries structure if multiple queries
    if (generatedQueries.length > 1) {
      try {
        geminiSqlService.validateSequentialQueries(generatedQueries);
        logger.debug('Sequential queries validation passed');
      } catch (error) {
        logger.warn('Sequential queries validation failed', { error: (error as Error).message });
        return NextResponse.json(responseFormatter.formatError(error as Error, 'SQL_ERROR'), {
          status: 400,
        });
      }
    }

    // Execute the queries
    let queryResult;
    try {
      logger.debug('Executing database queries', { queryCount: generatedQueries.length });
      if (generatedQueries.length === 1) {
        queryResult = await cricketQueryService.executeQuery(generatedQueries[0]);
      } else {
        queryResult = await cricketQueryService.executeSequentialQueries(generatedQueries);
      }
      logger.info('Database queries executed successfully', {
        rowCount: queryResult.rowCount,
        executionTime: queryResult.executionTime,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error('Database query execution failed', {
        error: errorMessage,
        queries: generatedQueries,
      });

      // Handle specific database errors
      if (errorMessage.includes('timeout') || errorMessage.includes('took too long')) {
        return NextResponse.json(responseFormatter.formatTimeoutError(sanitizedQuestion), {
          status: 408,
        });
      } else if (errorMessage.includes('connection') || errorMessage.includes('connect')) {
        return NextResponse.json(
          responseFormatter.formatError(
            'Database connection issue. Please try again in a moment.',
            'DATABASE_ERROR',
          ),
          { status: 503 },
        );
      } else {
        return NextResponse.json(
          responseFormatter.formatError(error as Error, 'DATABASE_ERROR', sanitizedQuestion),
          { status: 500 },
        );
      }
    }

    // Format the results
    const formattedData = cricketQueryService.formatResults(queryResult);
    const totalExecutionTime = Date.now() - startTime;

    // Return successful response
    const response = responseFormatter.formatResults(
      formattedData,
      generatedQueries.join('; '),
      totalExecutionTime,
    );

    logger.info('Text-to-SQL request completed successfully', {
      question: sanitizedQuestion,
      rowCount: response.metadata.rowCount,
      totalExecutionTime: response.metadata.executionTime,
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    logger.error('Unexpected error in text-to-sql API', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      question: body?.question || 'unknown',
    });

    return NextResponse.json(responseFormatter.formatServerError(), { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
