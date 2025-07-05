import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-[#FFC700] p-4 border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-black tracking-tighter">
          Boundary Bytes
        </Link>
        <nav className="flex gap-4">
          <Link href="/" className="text-lg font-bold text-black hover:text-gray-700">
            Home
          </Link>
          <Link href="/stats" className="text-lg font-bold text-black hover:text-gray-700">
            Stats
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
