import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bowlers = await prisma.wplDelivery.findMany({
      select: {
        bowler: true,
      },
      distinct: ['bowler'],
    });
    const bowlerNames = bowlers.map((b) => b.bowler);
    return NextResponse.json(bowlerNames);
  } catch (error) {
    console.error('Error fetching bowlers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
