import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const batters = await prisma.wplDelivery.findMany({
      select: {
        striker: true,
      },
      distinct: ['striker'],
    });
    const batterNames = batters.map((b) => b.striker);
    return NextResponse.json(batterNames);
  } catch (error) {
    console.error('Error fetching batters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
