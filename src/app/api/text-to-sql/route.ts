import { NextRequest, NextResponse } from 'next/server';
import { validateTextToSqlRequest, sanitizeInput } from '@/lib/validation/text-to-sql';
import { sqlValidator } from '@/lib/sql-validator';
import { geminiSqlService } from '@/services/gemini-sql';
import { cricketQueryService } from '@/services/cricket-query';
import { responseFormatter } from '@/lib/response-formatter';
import { normalizeTeamResults } from '@/lib/result-normalizer';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body: unknown = null;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: object) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const sendError = (error: object, status: number) => {
        sendEvent('error', { error, status });
        controller.close();
      };

      try {
        body = await request.json();
        logger.debug('Received text-to-SQL request', { body });

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          logger.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
          return sendError(
            responseFormatter.formatError('AI service configuration error', 'AI_ERROR'),
            503,
          );
        }

        const validation = validateTextToSqlRequest(body);
        if (!validation.success) {
          logger.warn('Input validation failed', { error: validation.error, body });
          return sendError(responseFormatter.formatError(validation.error, 'VALIDATION_ERROR'), 400);
        }

        const sanitizedQuestion = sanitizeInput(validation.data.question);
        logger.info('Processing cricket question', {
          originalQuestion: validation.data.question,
          sanitizedQuestion,
        });

        sendEvent('status', { message: 'Analyzing your request...' });

        let rawGeneratedQueries: string[] = [];
        let finalSql: string;
        try {
          logger.debug('Generating SQL with Gemini AI', { question: sanitizedQuestion });
          sendEvent('status', { message: 'Consulting with the third umpire for the query...' });
          rawGeneratedQueries = await geminiSqlService.generateSql(sanitizedQuestion);
          logger.info('SQL generated successfully', { queries: rawGeneratedQueries });

          if (rawGeneratedQueries.length > 1) {
            try {
              geminiSqlService.validateSequentialQueries(rawGeneratedQueries);
              logger.debug('Sequential queries validation passed');
            } catch (error) {
              logger.warn('Sequential queries validation failed', {
                error: (error as Error).message,
              });
              return sendError(responseFormatter.formatError(error as Error, 'SQL_ERROR'), 400);
            }
          }

          const runQuery = async (sql: string) => {
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

          const built = await geminiSqlService.buildExecutableQueries(rawGeneratedQueries, runQuery);
          finalSql = built[built.length - 1];

          const sqlValidation = sqlValidator.validateSql(finalSql);
          if (!sqlValidation.isValid) {
            logger.warn('Final SQL validation failed', { finalSql, errors: sqlValidation.errors });
            return sendError(
              responseFormatter.formatError(
                `Generated query failed security validation: ${sqlValidation.errors.join(', ')}`,
                'SQL_ERROR',
              ),
              400,
            );
          }
        } catch (error) {
          const errorMessage = (error as Error).message;
          logger.error('SQL generation/building failed', {
            error: errorMessage,
            question: sanitizedQuestion,
          });

          if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
            return sendError(
              responseFormatter.formatError(
                'AI service rate limit exceeded. Please try again in a moment.',
                'RATE_LIMIT_ERROR',
              ),
              429,
            );
          } else if (errorMessage.includes('unavailable') || errorMessage.includes('service')) {
            return sendError(responseFormatter.formatAiUnavailableError(), 503);
          } else {
            return sendError(
              responseFormatter.formatError(error as Error, 'AI_ERROR', sanitizedQuestion),
              500,
            );
          }
        }

        let queryResult;
        try {
          logger.debug('Executing final database query');
          sendEvent('status', { message: 'Bowling the delivery to fetch your stats...' });
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

          if (errorMessage.includes('timeout') || errorMessage.includes('took too long')) {
            return sendError(responseFormatter.formatTimeoutError(sanitizedQuestion), 408);
          } else if (errorMessage.includes('connection') || errorMessage.includes('connect')) {
            return sendError(
              responseFormatter.formatError(
                'Database connection issue. Please try again in a moment.',
                'DATABASE_ERROR',
              ),
              503,
            );
          } else {
            return sendError(
              responseFormatter.formatError(error as Error, 'DATABASE_ERROR', sanitizedQuestion),
              500,
            );
          }
        }

        let formattedData = cricketQueryService.formatResults(queryResult);
        const lowerSql = (finalSql || '').toLowerCase();
        if (
          /\bmi\.winner\b/.test(lowerSql) ||
          /\bd\.(batting_team|bowling_team)\b/.test(lowerSql) ||
          /\bp\.team_name\b/.test(lowerSql) ||
          /\bwins\b/.test(lowerSql)
        ) {
          formattedData = normalizeTeamResults(formattedData);
        }
        const totalExecutionTime = Date.now() - startTime;

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

        sendEvent('result', response);
        controller.close();
      } catch (error) {
        logger.error('Unexpected error in text-to-sql API', {
          error: (error as Error).message,
          stack: (error as Error).stack,
          question: (body as { question?: string })?.question || 'unknown',
        });
        sendError(responseFormatter.formatServerError(), 500);
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
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
