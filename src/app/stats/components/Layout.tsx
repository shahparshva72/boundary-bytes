'use client';

import { ReactNode } from 'react';

import { MoonLoader } from 'react-spinners';

interface LayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  children: ReactNode;
  loading?: boolean;
  error?: boolean;
}

const Layout = ({ title, description, children, loading, error }: LayoutProps) => {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-1.5 sm:p-2.5 pb-16 sm:pb-20 gap-2 sm:gap-3 md:gap-4 bg-[#FFFEE0] overflow-x-hidden">
      <main className="flex flex-col gap-3 sm:gap-4 md:gap-6 items-center w-full max-w-full mx-auto my-2 sm:my-3 md:my-4 overflow-x-hidden">
        {title && (
          <div className="flex flex-col items-center gap-2 sm:gap-3 mb-1 sm:mb-2 w-full px-2 sm:px-0">
            <div className="bg-[#FF5E5B] p-2 sm:p-3 md:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black w-full max-w-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-black text-center tracking-tight">
                {title}
              </h1>
            </div>
          </div>
        )}
        {description && (
          <div className="flex flex-col items-center gap-2 sm:gap-3 mb-1 sm:mb-2 w-full px-2 sm:px-0">
            <div className="bg-[#FF5E5B] p-2 sm:p-3 md:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black w-full max-w-2xl">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-black text-center tracking-tight">
                {description}
              </p>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center p-2 sm:p-3 md:p-4">
            <div className="flex items-center justify-center">
              <MoonLoader color="#4F46E5" size={50} />
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center p-2 sm:p-3 md:p-4">
            <div className="text-base sm:text-lg md:text-xl font-bold text-red-500">
              Error loading stats.
            </div>
          </div>
        )}
        {!loading && !error && children}
      </main>
    </div>
  );
};

export default Layout;
