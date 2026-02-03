import { Prisma } from '@/generated/prisma/client';

export const STANDARDIZED_BATTING_TEAM_SQL = Prisma.sql`
  CASE
    WHEN d.batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
    WHEN d.batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
    WHEN d.batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
    WHEN d.batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
    ELSE d.batting_team
  END
`;
