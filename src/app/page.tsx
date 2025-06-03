import Matches from '../components/matches';

export default function HomePage({
  searchParams,
}: {
  searchParams: { page?: string; season?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  
  return (
    <Matches 
      initialPage={currentPage}
      initialSeason={searchParams.season}
    />
  );
}