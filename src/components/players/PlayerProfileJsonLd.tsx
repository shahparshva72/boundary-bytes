import type { PlayerProfile } from '@/services/playerService';

interface PlayerProfileJsonLdProps {
  profile: PlayerProfile;
}

export default function PlayerProfileJsonLd({ profile }: PlayerProfileJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://boundarybytes.com';
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: `${baseUrl}/players/${profile.slug}`,
    knowsAbout: 'Cricket',
    memberOf: profile.leagueStats.map((league) => ({
      '@type': 'SportsTeam',
      name: league.league,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Players',
        item: `${baseUrl}/players`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile.name,
        item: `${baseUrl}/players/${profile.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
