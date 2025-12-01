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
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-2 sm:p-4 pb-16 sm:pb-20 gap-4 sm:gap-6 md:gap-8 bg-[#FFFEE0] overflow-x-hidden">
      <main className="flex flex-col gap-6 sm:gap-8 md:gap-[40px] items-center w-full max-w-full mx-auto my-4 sm:my-6 md:my-8 overflow-x-hidden">
        {title && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-2 sm:mb-4 w-full px-2 sm:px-0">
            <div className="bg-[#FF5E5B] p-4 sm:p-6 md:p-8 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 sm:border-4 border-black w-full max-w-2xl">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black text-center tracking-tight">
                {title}
              </h1>
            </div>
          </div>
        )}
        {description && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-2 sm:mb-4 w-full px-2 sm:px-0">
            <div className="bg-[#FF5E5B] p-4 sm:p-6 md:p-8 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 sm:border-4 border-black w-full max-w-2xl">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black text-center tracking-tight">
                {description}
              </p>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-center">
              <MoonLoader color="#4F46E5" size={50} />
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center p-4 sm:p-6 md:p-8">
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
