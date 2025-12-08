import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

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
}

// Export singleton instance
export const cricketQueryService = new CricketQueryService();
