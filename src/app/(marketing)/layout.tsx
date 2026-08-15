import Header from '@/components/Header';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFFEE0]">{children}</main>
    </>
  );
}
