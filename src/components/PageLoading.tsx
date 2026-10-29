'use client';

import { MoonLoader } from 'react-spinners';

const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FFFEE0]">
    <MoonLoader color="#FF5E5B" size={48} />
  </div>
);

export default PageLoading;
