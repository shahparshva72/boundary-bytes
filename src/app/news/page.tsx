'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  content: string;
  guid: string;
  image?: string | null;
}

interface NewsData {
  title: string;
  description: string;
  link: string;
  items: NewsItem[];
}

const fetchNews = async () => {
  const response = await fetch('/api/news');
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};

export default function NewsPage() {
  const {
    data: newsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cricketNews'],
    queryFn: fetchNews,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const newsData: NewsData | null = newsResponse?.data || null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFEE0] text-black">
      <div className="container mx-auto p-2 md:p-4 flex flex-col gap-4">
        <header className="text-center p-3 md:p-4 mb-2 bg-[#4ECDC4] border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black text-black text-center tracking-tight">
            Cricket News
          </h1>
          <p className="mt-2 text-base font-mono text-black">
            Latest cricket stories from ESPN Cricinfo
          </p>
        </header>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-7xl mx-auto w-full">
            {Array.from({ length: 9 }).map((_, index) => (
              <article
                key={`skeleton-${index}`}
                className="bg-white border-2 border-black shadow-[2px_2px_0_#000] overflow-hidden flex flex-col animate-pulse"
              >
                <div className="relative w-full h-48 bg-gray-300 border-b-2 border-black"></div>
                <div className="p-3 flex flex-col flex-grow gap-2">
                  <div className="h-6 bg-gray-300 rounded w-full"></div>
                  <div className="h-6 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mt-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="mt-4 h-10 bg-gray-300 rounded w-28"></div>
                </div>
              </article>
            ))}
          </div>
        )}

        {isError && (
          <div
            className="p-3 md:p-4 bg-[#FF5E5B] border-2 border-black shadow-[2px_2px_0_#000] flex flex-col gap-2 max-w-6xl mx-auto"
            role="alert"
          >
            <h3 className="text-2xl font-black text-black">Unable to fetch news</h3>
            <p className="font-mono text-black">
              Something went wrong while fetching cricket news. Please try again later.
            </p>
          </div>
        )}

        {newsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-7xl mx-auto w-full">
            {newsData.items.map((item, index) => (
              <article
                key={item.guid || index}
                className="bg-white border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group flex flex-col h-full"
                >
                  {item.image && (
                    <div className="relative w-full h-48 bg-gray-200 border-b-2 border-black overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-3 flex flex-col flex-grow">
                    <h2 className="text-lg font-black text-black mb-2 group-hover:text-[#FF5E5B] transition-colors line-clamp-3">
                      {item.title}
                    </h2>
                    <time className="text-xs font-mono text-gray-600 mb-2 block">
                      {formatDate(item.pubDate)}
                    </time>
                    <p className="font-mono text-black text-sm leading-relaxed line-clamp-3 flex-grow">
                      {item.contentSnippet}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-black text-white px-2 py-1.5 font-bold border-2 border-black group-hover:bg-[#FFC700] group-hover:text-black transition-colors self-start">
                      Read More
                      <span className="text-base">→</span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}

        {newsData && newsData.items.length === 0 && (
          <div className="p-3 md:p-4 bg-white border-2 border-black shadow-[2px_2px_0_#000] max-w-6xl mx-auto">
            <p className="font-mono text-black text-center">
              No cricket news available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
