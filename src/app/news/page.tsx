'use client';

import { useQuery } from '@tanstack/react-query';
import { MoonLoader } from 'react-spinners';

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

export default function NewsPage() {
  const {
    data: newsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cricketNews'],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
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
      <div className="container mx-auto p-4 md:p-8 flex flex-col gap-8">
        <header className="text-center p-8 mb-4 bg-[#4ECDC4] border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-black text-center tracking-tight">
            Cricket News
          </h1>
          <p className="mt-4 text-lg font-mono text-black">
            Latest cricket stories from ESPN Cricinfo
          </p>
        </header>

        {isLoading && (
          <div className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-black shadow-[4px_4px_0_#000] max-w-6xl mx-auto">
            <MoonLoader color="#1a202c" size={48} />
            <p className="font-bold text-black text-center text-lg">Loading cricket news...</p>
          </div>
        )}

        {isError && (
          <div
            className="p-8 bg-[#FF5E5B] border-2 border-black shadow-[4px_4px_0_#000] flex flex-col gap-4 max-w-6xl mx-auto"
            role="alert"
          >
            <h3 className="text-2xl font-black text-black">Unable to fetch news</h3>
            <p className="font-mono text-black">
              Something went wrong while fetching cricket news. Please try again later.
            </p>
          </div>
        )}

        {newsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
            {newsData.items.map((item, index) => (
              <article
                key={item.guid || index}
                className="bg-white border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group flex flex-col h-full"
                >
                  {item.image && (
                    <div className="relative w-full h-48 bg-gray-200 border-b-2 border-black overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <h2 className="text-xl font-black text-black mb-3 group-hover:text-[#FF5E5B] transition-colors line-clamp-3">
                      {item.title}
                    </h2>
                    <time className="text-xs font-mono text-gray-600 mb-3 block">
                      {formatDate(item.pubDate)}
                    </time>
                    <p className="font-mono text-black text-sm leading-relaxed line-clamp-3 flex-grow">
                      {item.contentSnippet}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-bold border-2 border-black group-hover:bg-[#FFC700] group-hover:text-black transition-colors self-start">
                      Read More
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}

        {newsData && newsData.items.length === 0 && (
          <div className="p-8 bg-white border-2 border-black shadow-[4px_4px_0_#000] max-w-6xl mx-auto">
            <p className="font-mono text-black text-center">
              No cricket news available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
