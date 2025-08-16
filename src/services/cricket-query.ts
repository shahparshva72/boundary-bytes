import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface QueryResult {
  data: unknown[];
  rowCount: number;
  executionTime: number;
}

export class CricketQueryService {
  /**
   * Executes a single SQL query using Prisma's type-safe $queryRaw method
   */
  async executeQuery(sql: string): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      // Clean up the SQL query (remove trailing semicolon if present)
      const cleanSql = sql.trim().replace(/;$/, '');

      // Execute the query using Prisma's $queryRaw for type safety
      const result = await prisma.$queryRaw(Prisma.sql([cleanSql]));

      const executionTime = Date.now() - startTime;

      // Convert result to array if it's not already
      const data = Array.isArray(result) ? result : [result];

      return {
        data,
        rowCount: data.length,
        executionTime,
      };
    } catch (error) {
      console.error('Database query execution error:', error);

      // Handle specific Prisma/database errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(this.handlePrismaError(error));
      } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Database query failed. Please check your question and try again.');
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new Error('Invalid query format. Please rephrase your cricket question.');
      } else {
        throw new Error('Failed to execute cricket statistics query. Please try again.');
      }
    }
  }

  /**
   * Executes multiple queries sequentially (for player name resolution scenarios)
   */
  async executeSequentialQueries(queries: string[]): Promise<QueryResult> {
    if (queries.length === 0) {
      throw new Error('No queries provided for execution');
    }

    if (queries.length === 1) {
      return this.executeQuery(queries[0]);
    }

    const startTime = Date.now();
    let finalResult: unknown[] = [];
    let totalRows = 0;
    const resolvedPlayerNames: string[] = [];

    try {
      // Execute queries sequentially, using results from previous queries
      for (let i = 0; i < queries.length; i++) {
        let query = queries[i];

        // If this is not the first query and we have resolved player names,
        // replace placeholder names in the query with resolved names
        if (i > 0 && resolvedPlayerNames.length > 0) {
          query = this.replacePlayerNamesInQuery(query, resolvedPlayerNames);
        }

        const result = await this.executeQuery(query);

        // Check if this is a player name resolution query
        if (this.isPlayerNameResolutionQuery(query)) {
          // Extract resolved player names - check multiple possible field names
          if (result.data.length > 0) {
            const firstRow = result.data[0] as Record<string, unknown>;
            const resolvedName =
              firstRow.player_name ||
              firstRow.playername ||
              firstRow.name ||
              Object.values(firstRow)[0];

            if (resolvedName && typeof resolvedName === 'string') {
              resolvedPlayerNames.push(resolvedName);
              console.log(`Resolved player name: ${resolvedName}`);
              console.log(`Full result data:`, result.data[0]);
            } else {
              console.log('Player name resolution result:', result.data[0]);
              throw new Error(
                'Player name not found in database. Please check the spelling or try a different player.',
              );
            }
          } else {
            throw new Error(
              'Player name not found in database. Please check the spelling or try a different player.',
            );
          }
        } else {
          // This is the main statistics query
          finalResult = result.data;
          totalRows = result.rowCount;
        }
      }

      const executionTime = Date.now() - startTime;

      // If we have resolved player names but no final results, there might be an issue
      if (resolvedPlayerNames.length > 0 && totalRows === 0) {
        throw new Error(
          `Found player(s) ${resolvedPlayerNames.join(', ')} but no statistics available. ` +
            'Try asking about different statistics or check if the player played in the specified season.',
        );
      }

      return {
        data: finalResult,
        rowCount: totalRows,
        executionTime,
      };
      } catch (error) {
        console.error('Sequential query execution error:', error);
        throw error; // Re-throw the error from executeQuery
      }
  }

  /**
   * Replaces player names in the main query with resolved names from the database
   */
  private replacePlayerNamesInQuery(query: string, resolvedPlayerNames: string[]): string {
    let updatedQuery = query;

    for (const resolvedName of resolvedPlayerNames) {
      // Replace placeholder patterns
      updatedQuery = updatedQuery.replace(/RESOLVED_PLAYER_NAME/g, resolvedName);

      // Also handle cases where the AI might have used the original name
      // Pattern 1: striker = 'PlayerName' (replace any existing player name)
      updatedQuery = updatedQuery.replace(/striker\s*=\s*'[^']+'/gi, `striker = '${resolvedName}'`);

      // Pattern 2: bowler = 'PlayerName'
      updatedQuery = updatedQuery.replace(/bowler\s*=\s*'[^']+'/gi, `bowler = '${resolvedName}'`);

      // Pattern 3: player_dismissed = 'PlayerName'
      updatedQuery = updatedQuery.replace(
        /player_dismissed\s*=\s*'[^']+'/gi,
        `player_dismissed = '${resolvedName}'`,
      );

      // Pattern 4: non_striker = 'PlayerName'
      updatedQuery = updatedQuery.replace(
        /non_striker\s*=\s*'[^']+'/gi,
        `non_striker = '${resolvedName}'`,
      );
    }

    console.log(`Original query: ${query}`);
    console.log(`Updated query with resolved names: ${updatedQuery}`);
    return updatedQuery;
  }

  /**
   * Determines if a query is for player name resolution
   */
  private isPlayerNameResolutionQuery(query: string): boolean {
    const normalizedQuery = query.toLowerCase().trim();
    return (
      normalizedQuery.includes('select player_name from wpl_player') &&
      normalizedQuery.includes('ilike') &&
      normalizedQuery.includes('order by case')
    );
  }

  /**
   * Handles Prisma-specific errors and converts them to user-friendly messages
   */
  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2001':
        return 'The cricket data you requested was not found. Please check player names or team names.';
      case 'P2002':
        return 'Duplicate data constraint error. Please rephrase your question.';
      case 'P2003':
        return 'Invalid relationship in cricket data. Please check your question.';
      case 'P2004':
        return 'Database constraint failed. Please rephrase your cricket question.';
      case 'P2021':
        return 'The cricket table you requested does not exist.';
      case 'P2022':
        return 'The cricket data column you requested does not exist.';
      case 'P2025':
        return 'No cricket records found matching your criteria.';
      default:
        return 'Database error occurred while fetching cricket statistics. Please try again.';
    }
  }

  /**
   * Formats query results for consistent API response
   */
  formatResults(queryResult: QueryResult): unknown[] {
    if (!queryResult.data || queryResult.data.length === 0) {
      return [];
    }

    // Convert BigInt values to numbers for JSON serialization
    return queryResult.data.map((row) => {
      const formattedRow: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
        if (typeof value === 'bigint') {
          formattedRow[key] = Number(value);
        } else if (value instanceof Date) {
          formattedRow[key] = value.toISOString();
        } else {
          formattedRow[key] = value;
        }
      }

      return formattedRow;
    });
  }

  /**
   * Validates that the query result is not empty and provides helpful feedback
   */
  validateResults(queryResult: QueryResult, originalQuestion: string): void {
    if (queryResult.rowCount === 0) {
      throw new Error(
        `No cricket statistics found for your question: "${originalQuestion}". ` +
          'Try asking about different players, teams, or seasons. ' +
          'For example: "Who are the top 5 run scorers in WPL 2023?" or "What is Smriti Mandhana\'s strike rate?"',
      );
    }
  }
}

// Export singleton instance
export const cricketQueryService = new CricketQueryService();
