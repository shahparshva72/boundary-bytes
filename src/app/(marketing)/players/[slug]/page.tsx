import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlayerProfileContent from '@/components/players/PlayerProfileContent';
import PlayerProfileJsonLd from '@/components/players/PlayerProfileJsonLd';
import { getPlayerProfile, listPlayerSlugs } from '@/services/playerService';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const { players } = await listPlayerSlugs(1, 100);
    return players.map((p) => ({ slug: p.slug }));
  } catch {
    // API may not be available at build time; fall back to on-demand rendering.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  if (!profile) {
    return {};
  }

  const leagues = profile.leagueStats.map((l) => l.league).join(', ');
  return {
    title: `${profile.name} Stats — Runs, Average, Strike Rate | Boundary Bytes`,
    description: `${profile.name}'s career batting and bowling stats across ${leagues}: runs, average, strike rate, wickets, economy and more.`,
    alternates: { canonical: `/players/${slug}` },
    openGraph: {
      title: `${profile.name} — Cricket Stats`,
      description: `Career stats for ${profile.name} across ${leagues}.`,
      type: 'profile',
    },
  };
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  if (!profile) {
    notFound();
  }

  return (
    <>
      <PlayerProfileJsonLd profile={profile} />
      <PlayerProfileContent profile={profile} />
    </>
  );
}
