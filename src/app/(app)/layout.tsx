import { Suspense } from 'react';
import Header from '@/components/Header';
import PageLoading from '@/components/PageLoading';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </>
  );
}
