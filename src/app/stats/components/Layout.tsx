'use client';

import { ReactNode } from 'react';

interface LayoutProps {
  title: string;
  children: ReactNode;
  loading?: boolean;
  error?: boolean;
}

const Layout = ({ title, children, loading, error }: LayoutProps) => {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full mx-auto my-8">
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-xl font-bold">Loading stats...</div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-xl font-bold text-red-500">Error loading stats.</div>
          </div>
        )}
        {!loading && !error && children}
      </main>
    </div>
  );
};

export default Layout;
