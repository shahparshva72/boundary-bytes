import { Prisma } from '@/generated/prisma/client';

export const BOWLER_CREDITED_WICKET_TYPES = [
  'caught',
  'bowled',
  'lbw',
  'stumped',
  'caught and bowled',
  'hit wicket',
] as const;

export const ALL_DISMISSAL_TYPES = [
  'caught',
  'bowled',
  'lbw',
  'stumped',
  'caught and bowled',
  'hit wicket',
  'run out',
  'retired hurt',
  'obstructing the field',
  'hit the ball twice',
  'handled the ball',
  'timed out',
] as const;

export const bowlerCreditedWicketTypesSql = Prisma.join(BOWLER_CREDITED_WICKET_TYPES);
export const allDismissalTypesSql = Prisma.join(ALL_DISMISSAL_TYPES);

export type BowlerCreditedWicketType = (typeof BOWLER_CREDITED_WICKET_TYPES)[number];
export type AllDismissalType = (typeof ALL_DISMISSAL_TYPES)[number];
