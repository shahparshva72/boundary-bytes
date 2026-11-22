import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MatchDetailContent from '@/components/matches/MatchDetailContent';
import { getMatchDetail } from '@/services/matchService';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getMatchDetail(id);
  if (!detail) {
    return {};
  }

  const { match } = detail;
  const teams = match.teams.join(' vs ') || `Match ${match.id}`;
  return {
    title: `${teams} Scorecard, ${match.league} ${match.season} | Boundary Bytes`,
    description: `${teams} at ${match.venue}${match.result ? `: ${match.result}` : ''}. Full scorecard, partnerships and over-by-over scoring.`,
    alternates: { canonical: `/matches/${match.id}` },
  };
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMatchDetail(id);
  if (!detail) {
    notFound();
  }

  return <MatchDetailContent detail={detail} />;
}
