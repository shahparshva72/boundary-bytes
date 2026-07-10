import PublicHeader from '@/components/PublicHeader';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-[#FFFEE0]">{children}</main>
    </>
  );
}
