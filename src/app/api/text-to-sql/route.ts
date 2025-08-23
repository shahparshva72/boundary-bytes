import { NextRequest, NextResponse } from 'next/server';
import { validateTextToSqlRequest, sanitizeInput } from '@/lib/validation/text-to-sql';
import { sqlValidator } from '@/lib/sql-validator';
import { geminiSqlService } from '@/services/gemini-sql';
import { cricketQueryService } from '@/services/cricket-query';
import { responseFormatter } from '@/lib/response-formatter';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body: unknown = null;

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

    // Generate SQL using Gemini AI, then resolve player lookups and build final executable SQL
    let rawGeneratedQueries: string[] = [];
    let finalSql: string;
    try {
      logger.debug('Generating SQL with Gemini AI', { question: sanitizedQuestion });
      rawGeneratedQueries = await geminiSqlService.generateSql(sanitizedQuestion);
      logger.info('SQL generated successfully', { queries: rawGeneratedQueries });

      // If multiple queries, validate sequential structure
      if (rawGeneratedQueries.length > 1) {
        try {
          geminiSqlService.validateSequentialQueries(rawGeneratedQueries);
          logger.debug('Sequential queries validation passed');
        } catch (error) {
          logger.warn('Sequential queries validation failed', { error: (error as Error).message });
          return NextResponse.json(
            responseFormatter.formatError(error as Error, 'SQL_ERROR'),
            { status: 400 },
          );
        }
      }

      // Provide a runQuery function for lookups that returns rows (array of objects)
      const runQuery = async (sql: string) => {
        // Validate lookup SQL before executing
        const validation = sqlValidator.validateSql(sql);
        if (!validation.isValid) {
          logger.warn('Lookup SQL failed validation', { sql, errors: validation.errors });
          throw new Error(
            `Generated lookup query failed security validation: ${validation.errors.join(', ')}`,
          );
        }

        const result = await cricketQueryService.executeQuery(sql);
        return (result.data as Array<Record<string, unknown>>) || [];
      };

      // Build final executable SQL with placeholders resolved when needed
      const built = await geminiSqlService.buildExecutableQueries(rawGeneratedQueries, runQuery);
      finalSql = built[built.length - 1];

      // Validate the final SQL for safety
      const sqlValidation = sqlValidator.validateSql(finalSql);
      if (!sqlValidation.isValid) {
        logger.warn('Final SQL validation failed', { finalSql, errors: sqlValidation.errors });
        return NextResponse.json(
          responseFormatter.formatError(
            `Generated query failed security validation: ${sqlValidation.errors.join(', ')}`,
            'SQL_ERROR',
          ),
          { status: 400 },
        );
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error('SQL generation/building failed', {
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

    // Execute only the final, fully-resolved SQL
    let queryResult;
    try {
      logger.debug('Executing final database query');
      queryResult = await cricketQueryService.executeQuery(finalSql);
      logger.info('Database query executed successfully', {
        rowCount: queryResult.rowCount,
        executionTime: queryResult.executionTime,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error('Database query execution failed', {
        error: errorMessage,
        query: finalSql,
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
      finalSql,
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
      question: (body as { question?: string })?.question || 'unknown',
    });

    return NextResponse.json(responseFormatter.formatServerError(), { status: 500 });
  }
}

// Handle OPTIONS request for CORS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
