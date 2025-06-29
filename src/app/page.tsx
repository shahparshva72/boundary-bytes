import Matches from '../components/matches';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; season?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const initialSeason = resolvedSearchParams?.season;

  return (
    <Matches
      initialPage={currentPage}
      initialSeason={initialSeason}
    />
  );
}