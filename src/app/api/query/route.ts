import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Function to handle BigInt serialization
function serializeBigInt(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle BigInt values
  if (typeof data === 'bigint') {
    return data.toString();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeBigInt(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializeBigInt(data[key]);
      }
    }
    return result;
  }

  // Return other types as is
  return data;
}

// Function to validate if a query is potentially harmful
function isQueryPotentiallyHarmful(query: string): boolean {
  // Convert to lowercase for easier checking
  const lowerQuery = query.toLowerCase();

  // Check for potentially harmful operations
  const dangerousOperations = [
    'drop table',
    'drop database',
    'truncate table',
    'delete from',
    'alter table',
    'create table',
    'insert into',
    'update',
    'grant',
    'revoke'
  ];

  return dangerousOperations.some(op => lowerQuery.includes(op));
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json({ error: 'A valid SQL query string must be provided' }, { status: 400 });
    }
    // Remove markdown fences or ```sql wrappers
    const rawQuery: string = body.query;
    const cleaned = rawQuery.replace(/```(?:sql)?\s*|```/gi, '').trim();
    // Validate cleaned SQL via Zod
    const schema = z.object({
      query: z.string()
        .min(1, 'Query cannot be empty')
        .refine(q => /^select\s+/i.test(q), { message: 'Only SELECT queries are allowed' })
        .refine(q => !/\b(insert|update|delete|drop|alter|truncate|create|grant|revoke)\b/i.test(q), {
          message: 'DML or DDL operations are not permitted',
        }),
    });
    const { query } = schema.parse({ query: cleaned });

    // Execute the safe SELECT query using Prisma (parameter binding only)
    const rawResults = await prisma.$queryRawUnsafe(query);
    const serializedResults = serializeBigInt(rawResults);
    return NextResponse.json({ results: serializedResults });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map(e => e.message).join('; ') }, { status: 400 });
    }
    console.error('Error executing raw query:', error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.message}`, code: error.code },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: `Query validation error: ${error.message}` },
        { status: 400 }
      );
    }

    // Handle BigInt serialization errors
    if (error instanceof TypeError && error.message.includes('BigInt')) {
      return NextResponse.json(
        { error: 'Query returned values that could not be serialized. This has been fixed, please try again.' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: `Failed to execute query: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
